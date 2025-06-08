//! 急上昇スコア計算用のWASMモジュール（完全版）

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

// ログ出力用のJavaScript関数をインポート
#[wasm_bindgen]
extern "C" {
    // ファイルに書き込むためのJS関数
    fn log_wasm_calculation(post_id: u32, action: &str, message: &str, data_json: &str);
    
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// JSONシリアライズのヘルパー関数
fn log_calculation(post_id: u32, action: &str, message: &str, data: impl Serialize) {
    match serde_json::to_string(&data) {
        Ok(json) => log_wasm_calculation(post_id, action, message, &json),
        Err(_) => log_wasm_calculation(post_id, action, message, "{}")
    }
}

/// トレンド統計データを表す構造体
#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct TrendStats {
    pub score: f64,        // 総合スコア
    pub growth_rate: f64,  // 成長率
    pub momentum: f64,     // 勢い
    pub engagement: f64,   // エンゲージメント
    pub unique_users: u32, // 推定ユニークユーザー数
}

/// 急上昇スコア計算結果を表す構造体
#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct TrendingResult {
    pub score: f64,
    pub base_score: f64,
    pub time_decay: f64,
    pub momentum_factor: f64,
    pub diversity_factor: f64,
}

/// 時間窓のメトリクスを表す構造体
#[derive(Serialize, Deserialize, Debug)]
struct WindowMetrics {
    start_time: u64,   // 窓開始時間
    end_time: u64,     // 窓終了時間
    metrics: Metrics,  // メトリクス
}

/// メトリクスを表す構造体
#[derive(Serialize, Deserialize, Debug)]
struct Metrics {
    unique_users: u32, // ユニークユーザー数
    total_views: u32,  // 総閲覧数
}

/// 閲覧イベントを表す構造体
#[derive(Serialize, Deserialize, Debug)]
struct ViewEvent {
    timestamp: u64,        // イベント発生時間
    user_id: u32,          // ユーザーID
    engagement_score: f64, // エンゲージメントスコア
    event_type: Option<String>, // イベントタイプ (like, comment, bookmark)
}

/// 直接計算用データ構造体
#[derive(Serialize, Deserialize)]
struct DirectCalculationData {
    view_increase: u32,
    unique_users: u32,
    like_increase: u32,
    bookmark_count: u32,
    comment_increase: u32,
    previous_increase_rate: f64,
    current_increase_rate: f64,
    total_views_all_time: u32,
    total_unique_users_all_time: u32,
    last_updated: u64,
}

/// Redis HLLデータを表す構造体
#[derive(Serialize, Deserialize)]
struct RedisHllData {
    unique_users: u32,
    view_count: u32,
    previous_view_count: u32,
    view_count_per_hour: f64,
    like_count: u32,
    comment_count: u32,
    bookmark_count: u32,     // 本棚追加数
    last_activity_time: u64,
}

/// トレンド計算機の本体
#[wasm_bindgen]
pub struct TrendCalculator {
    aggregated_windows: Vec<WindowMetrics>, // 集約された時間窓
    recent_events: Vec<ViewEvent>,          // 最近の未集約イベント
    period_type: u8,                        // 期間タイプ (0: 日次, 1: 週次, 2: 月次, 3: 年次)
    post_id: u32,                           // 投稿ID
}

#[wasm_bindgen]
impl TrendCalculator {
    /// 新しいトレンド計算機を作成
    #[wasm_bindgen(constructor)]
    pub fn new(post_id: u32, period_type: u8) -> TrendCalculator {
        // 計算開始をログ
        log_calculation(post_id, "init", 
            "トレンド計算機を初期化", 
            serde_json::json!({
                "post_id": post_id,
                "period_type": period_type
            })
        );
        
        TrendCalculator {
            aggregated_windows: Vec::new(),
            recent_events: Vec::new(),
            period_type: period_type,
            post_id: post_id,
        }
    }

    /// 集約済み時間窓データを設定
    #[wasm_bindgen]
    pub fn set_aggregated_windows(&mut self, windows_json: &str) {
        match serde_json::from_str::<Vec<WindowMetrics>>(windows_json) {
            Ok(windows) => {
                let sample = if windows.is_empty() {
                    None
                } else {
                    // 最初の要素のみを取得
                    Some(serde_json::json!({
                        "start_time": windows[0].start_time,
                        "end_time": windows[0].end_time,
                        "metrics": {
                            "unique_users": windows[0].metrics.unique_users,
                            "total_views": windows[0].metrics.total_views
                        }
                    }))
                };
                
                // 設定されたデータの概要をログ
                log_calculation(self.post_id, "set_windows", 
                    &format!("時間窓データを設定 ({} 件)", windows.len()), 
                    serde_json::json!({
                        "count": windows.len(),
                        "sample": sample
                    })
                );
                
                self.aggregated_windows = windows;
            },
            Err(e) => {
                // JSON解析エラーをログ
                log_calculation(self.post_id, "error", 
                    "時間窓データのJSONを解析できませんでした", 
                    serde_json::json!({
                        "error": e.to_string(),
                        "input_preview": if windows_json.len() > 100 { 
                            format!("{}...", &windows_json[..100]) 
                        } else { 
                            windows_json.to_string() 
                        }
                    })
                );
            }
        }
    }

    /// 未集約の最近のイベントを設定
    #[wasm_bindgen]
    pub fn set_recent_events(&mut self, events_json: &str) {
        match serde_json::from_str::<Vec<ViewEvent>>(events_json) {
            Ok(events) => {
                let sample = if events.is_empty() {
                    None
                } else {
                    // 最初の要素のみを取得
                    Some(serde_json::json!({
                        "timestamp": events[0].timestamp,
                        "user_id": events[0].user_id,
                        "engagement_score": events[0].engagement_score,
                        "event_type": events[0].event_type
                    }))
                };
                
                // 設定されたデータの概要をログ
                log_calculation(self.post_id, "set_events", 
                    &format!("イベントデータを設定 ({} 件)", events.len()), 
                    serde_json::json!({
                        "count": events.len(),
                        "sample": sample
                    })
                );
                
                self.recent_events = events;
            },
            Err(e) => {
                // JSON解析エラーをログ
                log_calculation(self.post_id, "error", 
                    "イベントデータのJSONを解析できませんでした", 
                    serde_json::json!({
                        "error": e.to_string(),
                        "input_preview": if events_json.len() > 100 { 
                            format!("{}...", &events_json[..100]) 
                        } else { 
                            events_json.to_string() 
                        }
                    })
                );
            }
        }
    }

    /// メイン計算関数（従来の複雑なロジック）
    #[wasm_bindgen]
    pub fn calculate_trend_score(&self) -> JsValue {
        // 現在時刻
        let now = js_sys::Date::now() as u64;
        
        // 期間の開始時刻を計算
        let period_start = match self.period_type {
            0 => now - 24 * 60 * 60 * 1000,       // 日次: 24時間前
            1 => now - 7 * 24 * 60 * 60 * 1000,   // 週次: 1週間前
            2 => now - 30 * 24 * 60 * 60 * 1000,  // 月次: 30日前
            3 => now - 365 * 24 * 60 * 60 * 1000, // 年次: 1年前
            _ => now - 24 * 60 * 60 * 1000,       // デフォルト: 24時間前
        };
        
        // 計算開始をログ
        log_calculation(self.post_id, "start", 
            "ランキングスコア計算を開始", 
            serde_json::json!({
                "period_type": self.period_type,
                "window_count": self.aggregated_windows.len(),
                "event_count": self.recent_events.len()
            })
        );
        
        // 1. 時間窓からベース統計を計算
        let base_stats = self.calculate_from_windows(period_start, now);
        
        log_calculation(self.post_id, "base_stats", 
            "時間窓からの基本統計を計算", 
            serde_json::json!({
                "total_views": base_stats.total_views,
                "unique_users": base_stats.unique_users,
                "growth_rate": base_stats.growth_rate,
                "momentum": base_stats.momentum
            })
        );
        
        // 2. 最近のイベントからの統計を計算
        let recent_stats = self.process_recent_events(period_start, now);
        
        log_calculation(self.post_id, "recent_stats", 
            "最近のイベントデータを処理", 
            serde_json::json!({
                "total_views": recent_stats.total_views,
                "unique_users": recent_stats.unique_users,
                "engagement": recent_stats.engagement
            })
        );

        // 3. 統計を結合して総合指標を作成
        let total_stats = self.combine_stats(base_stats, recent_stats);
        
        // 4. イベントタイプの分布を分析
        let event_weights = self.analyze_event_distribution();
        
        log_calculation(self.post_id, "event_distribution", 
            "イベントタイプの分布を分析", 
            serde_json::json!({
                "like_ratio": event_weights.like_ratio,
                "comment_ratio": event_weights.comment_ratio,
                "bookmark_ratio": event_weights.bookmark_ratio,
                "quality_factor": event_weights.quality_factor
            })
        );
        
        // 5. ベーススコアの計算
        let base_score = self.calculate_base_score(&total_stats, &event_weights);
        
        // 6. 時間減衰係数を適用
        let time_decayed_score = self.apply_time_decay(base_score, period_start, now);
        
        // 7. 投稿ID固有のノイズを追加して同一スコアを防止
        let uniqueness_factor = 0.95 + ((self.post_id % 100) as f64 / 1000.0);
        let final_score = (time_decayed_score * uniqueness_factor * 100.0).round() / 100.0;
        
        log_calculation(self.post_id, "final_score", 
            "最終スコアを計算", 
            serde_json::json!({
                "base_score": base_score,
                "time_decayed_score": time_decayed_score,
                "uniqueness_factor": uniqueness_factor,
                "final_score": final_score,
                "growth_rate": total_stats.growth_rate,
                "momentum": total_stats.momentum,
                "engagement": total_stats.engagement
            })
        );
        
        // 結果をJavaScriptに返す
        let stats = TrendStats {
            score: final_score,
            growth_rate: total_stats.growth_rate,
            momentum: total_stats.momentum,
            engagement: total_stats.engagement,
            unique_users: total_stats.unique_users,
        };

        serde_wasm_bindgen::to_value(&stats).unwrap_or(JsValue::NULL)
    }

    /// 新しい仕様での直接計算（簡素化版）
    #[wasm_bindgen]
    pub fn calculate_trending_score_direct(&self, calc_data_json: &str) -> JsValue {
        let calc_data: DirectCalculationData = match serde_json::from_str(calc_data_json) {
            Ok(data) => data,
            Err(e) => {
                log_wasm_calculation(self.post_id, "error", 
                    "計算データのJSON解析に失敗", 
                    &format!("{{\"error\": \"{}\"}}", e)
                );
                return JsValue::NULL;
            }
        };
        
        let now = js_sys::Date::now() as u64;
        
        // 計算開始をログ
        log_wasm_calculation(self.post_id, "start", 
            "新しい仕様での急上昇スコア計算を開始", 
            &serde_json::to_string(&calc_data).unwrap_or_default()
        );
        
        // 1. 基本スコア計算
        let base_score = 
            (calc_data.view_increase as f64 * 1.0) +
            (calc_data.like_increase as f64 * 3.0) +
            (calc_data.bookmark_count as f64 * 5.0) +
            (calc_data.comment_increase as f64 * 2.0);
        
        // 2. 時間減衰係数
        let hours_elapsed = (now - calc_data.last_updated) as f64 / (1000.0 * 60.0 * 60.0);
        let decay_rate = match self.period_type {
            0 => 0.1,  // 日次
            1 => 0.05, // 週次
            2 => 0.02, // 月次
            3 => 0.005, // 年次
            _ => 0.1,
        };
        let time_decay = (-decay_rate * hours_elapsed).exp();
        
        // 3. 勢い係数
        let acceleration = calc_data.current_increase_rate / calc_data.previous_increase_rate.max(0.01);
        let momentum_weight = match self.period_type {
            0 => 2.0, // 日次
            1 => 1.5, // 週次
            2 => 1.0, // 月次
            3 => 0.5, // 年次
            _ => 2.0,
        };
        let momentum_factor = ((acceleration + 1.0).log10() * momentum_weight).min(5.0);
        
        // 4. ユーザー多様性係数
        let diversity_ratio = if calc_data.total_views_all_time > 0 {
            calc_data.total_unique_users_all_time as f64 / calc_data.total_views_all_time as f64
        } else {
            0.0
        };
        let diversity_weight = match self.period_type {
            0 => 1.5, // 日次
            1 => 1.8, // 週次
            2 => 2.0, // 月次
            3 => 2.5, // 年次
            _ => 1.5,
        };
        let diversity_factor = 1.0 + (diversity_ratio * diversity_weight);
        
        // 5. 最終スコア計算
        let final_score = base_score * time_decay * (1.0 + momentum_factor) * diversity_factor;
        
        // 結果をログ
        log_wasm_calculation(self.post_id, "result", 
            "急上昇スコア計算完了", 
            &serde_json::to_string(&TrendingResult {
                score: final_score,
                base_score,
                time_decay,
                momentum_factor,
                diversity_factor,
            }).unwrap_or_default()
        );
        
        let result = TrendingResult {
            score: final_score,
            base_score,
            time_decay,
            momentum_factor,
            diversity_factor,
        };
        
        serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
    }

    /// Redis HLLデータに基づいて直接計算する
    #[wasm_bindgen]
    pub fn calculate_with_redis_hll_data(&self, redis_data_json: &str) -> JsValue {
        let redis_data: RedisHllData = match serde_json::from_str(redis_data_json) {
            Ok(data) => data,
            Err(e) => {
                log_calculation(self.post_id, "error", 
                    "Redis HLLデータのJSONを解析できませんでした", 
                    serde_json::json!({
                        "error": e.to_string()
                    })
                );
                return JsValue::NULL;
            }
        };
        
        // 現在時刻
        let now = js_sys::Date::now() as u64;
        
        // 成長率を計算
        let growth_rate = if redis_data.previous_view_count > 0 {
            (redis_data.view_count as f64 - redis_data.previous_view_count as f64) / redis_data.previous_view_count as f64
        } else {
            1.0 // 前回データがない場合は100%成長と見なす
        };
        
        // モメンタムを計算
        let momentum = if redis_data.view_count_per_hour > 0.0 {
            (redis_data.view_count_per_hour.log10() * 0.5).min(2.0)
        } else {
            0.0
        };
        
        // エンゲージメントスコアを計算 - 本棚追加数を考慮
        let raw_engagement = redis_data.like_count as f64 * 2.0 + 
            redis_data.comment_count as f64 * 3.0 + 
            redis_data.bookmark_count as f64 * 5.0;
        
        let engagement = if redis_data.view_count > 0 {
            raw_engagement / redis_data.view_count as f64
        } else {
            0.0
        };
        
        // パラメータと重み付け
        let weights = match self.period_type {
            0 => [0.4, 0.3, 0.2, 0.1], // 日次
            1 => [0.3, 0.3, 0.3, 0.1], // 週次
            2 => [0.2, 0.3, 0.4, 0.1], // 月次
            3 => [0.1, 0.3, 0.5, 0.1], // 年次
            _ => [0.4, 0.3, 0.2, 0.1], // デフォルト
        };
        
        // 重み付けスコア計算
        let view_score = redis_data.view_count as f64 * 0.1;
        let unique_score = redis_data.unique_users as f64;
        
        // 成長率を正規化（-1.0〜2.0を0.0〜3.0に変換）
        let normalized_growth = growth_rate.max(-1.0).min(2.0) + 1.0;
        
        // モメンタムを正規化（-1.0〜2.0を0.0〜3.0に変換）
        let normalized_momentum = momentum + 1.0;
        
        // エンゲージメントは0.0〜1.0のため3倍して同スケールに
        let normalized_engagement = engagement * 3.0;
        
        // 各要素のスコアを重み付け
        let base_score = view_score * weights[0]
            + unique_score * weights[1]
            + normalized_growth * 100.0 * weights[2]
            + normalized_momentum * 50.0 * weights[3]
            + normalized_engagement * 50.0 * weights[3];
        
        // 時間減衰係数を適用
        let time_since_activity = (now - redis_data.last_activity_time) / (1000 * 60 * 60);
        let decay_rate = match self.period_type {
            0 => 0.1,
            1 => 0.05,
            2 => 0.02,
            3 => 0.005,
            _ => 0.05,
        };
        let time_decay = (-decay_rate * time_since_activity as f64).exp();
        
        // 時間減衰を適用したスコア
        let time_decayed_score = base_score * time_decay;
        
        // 投稿ID固有のノイズを追加して同一スコアを防止
        let uniqueness_factor = 0.95 + ((self.post_id % 100) as f64 / 1000.0);
        let final_score = (time_decayed_score * uniqueness_factor * 100.0).round() / 100.0;
        
        // ログにスコア計算の詳細を出力
        log_calculation(self.post_id, "hll_score", 
            "Redis HLLデータからスコアを計算", 
            serde_json::json!({
                "view_count": redis_data.view_count,
                "unique_users": redis_data.unique_users,
                "like_count": redis_data.like_count,
                "comment_count": redis_data.comment_count,
                "bookmark_count": redis_data.bookmark_count,
                "base_score": base_score,
                "time_decay": time_decay,
                "uniqueness_factor": uniqueness_factor,
                "final_score": final_score
            })
        );
        
        // 結果をJavaScriptに返す
        let stats = TrendStats {
            score: final_score,
            growth_rate,
            momentum,
            engagement,
            unique_users: redis_data.unique_users,
        };
        
        serde_wasm_bindgen::to_value(&stats).unwrap_or(JsValue::NULL)
    }

    /// 時間窓から基本統計を計算（複雑なロジック）
    fn calculate_from_windows(&self, period_start: u64, now: u64) -> TotalStats {
        // 対象期間内の時間窓だけを使用
        let relevant_windows: Vec<&WindowMetrics> = self
            .aggregated_windows
            .iter()
            .filter(|w| w.end_time >= period_start && w.start_time <= now)
            .collect();

        if relevant_windows.is_empty() {
            return TotalStats::default();
        }

        // 時間ごとのビューカウント集計
        let mut hourly_counts: HashMap<u64, u32> = HashMap::new();
        let mut total_views = 0;
        let mut unique_user_estimate = 0;

        for window in &relevant_windows {
            // 総閲覧数を集計
            total_views += window.metrics.total_views;

            // ユニークユーザー数を集計
            unique_user_estimate += window.metrics.unique_users;

            // 時間単位で切り捨てた時間をキーにして集計
            let hour_key = window.start_time / (60 * 60 * 1000);
            *hourly_counts.entry(hour_key).or_insert(0) += window.metrics.total_views;
        }

        // ユニークユーザー数の重複を考慮した補正（概算）
        let windows_count = relevant_windows.len() as f64;
        let unique_correction_factor = 1.0 / (1.0 + (windows_count * 0.05));
        let corrected_unique_users =
            (unique_user_estimate as f64 * unique_correction_factor) as u32;

        // 時系列的な成長とモメンタムを計算
        let (growth_rate, momentum) = self.calculate_growth_and_momentum(&hourly_counts, now);

        // エンゲージメントスコアは時間窓では計算できないため0
        let engagement = 0.0;

        TotalStats {
            total_views,
            unique_users: corrected_unique_users,
            growth_rate,
            momentum,
            engagement,
        }
    }

    /// 最近のイベントから統計を計算
    fn process_recent_events(&self, period_start: u64, now: u64) -> TotalStats {
        // 期間内のイベントのみ使用
        let recent_events: Vec<&ViewEvent> = self
            .recent_events
            .iter()
            .filter(|e| e.timestamp >= period_start && e.timestamp <= now)
            .collect();

        if recent_events.is_empty() {
            return TotalStats::default();
        }

        // ユニークユーザーを集計
        let mut unique_users = std::collections::HashSet::new();
        for event in &recent_events {
            unique_users.insert(event.user_id);
        }

        // イベントタイプごとのカウントとエンゲージメントを計算
        let mut like_count = 0;
        let mut comment_count = 0;
        let mut bookmark_count = 0;
        let mut total_engagement = 0.0;

        for event in &recent_events {
            total_engagement += event.engagement_score;
            
            // イベントタイプに基づいてカウント
            if let Some(event_type) = &event.event_type {
                match event_type.as_str() {
                    "like" => like_count += 1,
                    "comment" => comment_count += 1,
                    "bookmark" => bookmark_count += 1,
                    _ => {} // その他のイベントタイプ
                }
            }
        }

        // 平均エンゲージメントスコアを計算
        let avg_engagement = if !recent_events.is_empty() {
            total_engagement / recent_events.len() as f64
        } else {
            0.0
        };

        // エンゲージメントを調整（いいね/コメント/本棚の重み付け）
        let event_count = recent_events.len().max(1) as f64;
        let adjusted_engagement = (
            (like_count as f64 * 2.0) + 
            (comment_count as f64 * 3.0) + 
            (bookmark_count as f64 * 5.0)
        ) / event_count;

        // 最終的なエンゲージメントスコア（基本 + 調整）
        let final_engagement = (avg_engagement + adjusted_engagement) / 2.0;

        // 時間ごとのイベント数を集計
        let mut hourly_counts: HashMap<u64, u32> = HashMap::new();
        for event in &recent_events {
            let hour_key = event.timestamp / (60 * 60 * 1000);
            *hourly_counts.entry(hour_key).or_insert(0) += 1;
        }

        // 成長率とモメンタムを計算
        let (growth_rate, momentum) = self.calculate_growth_and_momentum(&hourly_counts, now);

        TotalStats {
            total_views: recent_events.len() as u32,
            unique_users: unique_users.len() as u32,
            growth_rate,
            momentum,
            engagement: final_engagement,
        }
    }

    /// イベントタイプの分布を分析
    fn analyze_event_distribution(&self) -> EventWeights {
        if self.recent_events.is_empty() {
            return EventWeights::default();
        }

        let mut like_count = 0;
        let mut comment_count = 0;
        let mut bookmark_count = 0;
        let total_events = self.recent_events.len();

        // 各タイプのカウント
        for event in &self.recent_events {
            if let Some(event_type) = &event.event_type {
                match event_type.as_str() {
                    "like" => like_count += 1,
                    "comment" => comment_count += 1,
                    "bookmark" => bookmark_count += 1,
                    _ => {} // その他
                }
            }
        }

        // 各タイプの比率を計算
        let like_ratio = like_count as f64 / total_events as f64;
        let comment_ratio = comment_count as f64 / total_events as f64;
        let bookmark_ratio = bookmark_count as f64 / total_events as f64;

        // 高品質エンゲージメント係数を計算
        // コメントと本棚追加は高品質（重み大）、いいねは基本（重み小）
        let quality_factor = like_ratio * 1.0 + 
            comment_ratio * 2.0 + 
            bookmark_ratio * 3.0;

        EventWeights {
            like_ratio,
            comment_ratio,
            bookmark_ratio,
            quality_factor,
        }
    }

    /// ベーススコアを計算
    fn calculate_base_score(&self, stats: &TotalStats, weights: &EventWeights) -> f64 {
        // パラメータと重み付け
        let period_weights = match self.period_type {
            0 => [0.4, 0.3, 0.2, 0.1], // 日次
            1 => [0.3, 0.3, 0.3, 0.1], // 週次
            2 => [0.2, 0.3, 0.4, 0.1], // 月次
            3 => [0.1, 0.3, 0.5, 0.1], // 年次
            _ => [0.4, 0.3, 0.2, 0.1], // デフォルト
        };

        // 閲覧数スコア
        let view_score = stats.total_views as f64 * 0.1;
        
        // ユニークユーザースコア
        let unique_score = stats.unique_users as f64;

        // 成長率を正規化（-1.0〜2.0を0.0〜3.0に変換）
        let normalized_growth = stats.growth_rate.max(-1.0).min(2.0) + 1.0;

        // モメンタムを正規化（-1.0〜2.0を0.0〜3.0に変換）
        let normalized_momentum = stats.momentum + 1.0;

        // エンゲージメントを正規化
        let normalized_engagement = stats.engagement * 3.0;

        // エンゲージメント品質係数（高品質なエンゲージメントを評価）
        let quality_multiplier = 1.0 + (weights.quality_factor * 0.5);
        
        // 各要素のスコアを重み付け
        let weighted_score = (
            view_score * period_weights[0] +
            unique_score * period_weights[1] +
            normalized_growth * 100.0 * period_weights[2] +
            normalized_momentum * 50.0 * period_weights[3] +
            normalized_engagement * 50.0 * period_weights[3]
        ) * quality_multiplier;

        weighted_score
    }

    /// 時間減衰係数を適用
    fn apply_time_decay(&self, base_score: f64, period_start: u64, now: u64) -> f64 {
        // 最後のアクティビティの時間（デフォルトは現在）
        let last_activity = if let Some(last_event) = self.recent_events.iter().max_by_key(|e| e.timestamp) {
            last_event.timestamp
        } else {
            now
        };

        // 最後のアクティビティからの経過時間（時間単位）
        let hours_elapsed = (now - last_activity) as f64 / (1000.0 * 60.0 * 60.0);
        
        // 期間ごとの減衰率
        let decay_rate = match self.period_type {
            0 => 0.1,  // 日次: 10%/時間
            1 => 0.05, // 週次: 5%/時間
            2 => 0.02, // 月次: 2%/時間
            3 => 0.01, // 年次: 1%/時間
            _ => 0.05  // デフォルト
        };
        
        // 経過時間に基づく減衰係数を計算
        let time_decay = (-decay_rate * hours_elapsed).exp();
        
        // 期間の総時間
        let _total_hours = match self.period_type {
            0 => 24,      // 日次
            1 => 24 * 7,  // 週次
            2 => 24 * 30, // 月次
            3 => 24 * 365,// 年次
            _ => 24       // デフォルト
        } as f64;
        
        // 期間内でのアクティビティの位置（0.0〜1.0）
        let period_position = (now - last_activity) as f64 / ((now - period_start) as f64);
        let freshness_boost = (1.0 - period_position.min(1.0).max(0.0)) * 0.5; // 0.0〜0.5のブースト
        
        // 減衰係数と鮮度ブーストを組み合わせた最終係数
        let final_decay = time_decay * (1.0 + freshness_boost);
        
        // 減衰係数をスコアに適用
        base_score * final_decay
    }

    /// 成長率とモメンタムを計算
    fn calculate_growth_and_momentum(
        &self,
        hourly_counts: &HashMap<u64, u32>,
        now: u64,
    ) -> (f64, f64) {
        if hourly_counts.is_empty() {
            return (0.0, 0.0);
        }

        // 時間ごとのカウントを時系列順にソート
        let mut sorted_hours: Vec<_> = hourly_counts.iter().collect();
        sorted_hours.sort_by_key(|&(hour, _)| *hour);

        // 定数定義
        let hour_in_ms = 60 * 60 * 1000;
        let current_hour = now / hour_in_ms;

        // 現在の時間から遡って最新の数時間と過去の数時間を比較
        let hours_to_compare = match self.period_type {
            0 => 4,   // 日次: 直近4時間 vs その前4時間
            1 => 24,  // 週次: 直近1日 vs その前1日
            2 => 72,  // 月次: 直近3日 vs その前3日
            3 => 168, // 年次: 直近1週間 vs その前1週間
            _ => 4,   // デフォルト: 4時間
        };

        // 最新期間と過去期間のカウント合計
        let mut recent_count = 0;
        let mut previous_count = 0;

        for &(hour, count) in &sorted_hours {
            let hours_ago = current_hour.saturating_sub(*hour); // オーバーフロー防止

            if hours_ago < hours_to_compare {
                // 最新期間
                recent_count += count;
            } else if hours_ago < hours_to_compare * 2 {
                // 過去期間
                previous_count += count;
            }
        }

        // 成長率を計算
        let growth_rate = if previous_count == 0 {
            if recent_count > 0 {
                2.0
            } else {
                0.0
            } // 新規の場合は固定値
        } else {
            let raw_growth = (recent_count as f64 - previous_count as f64) / previous_count as f64;
            raw_growth.max(-1.0) // 下限を-100%に制限
        };

        // モメンタムを計算
        let momentum = if sorted_hours.len() < 3 {
            // 十分なデータがない場合
            if growth_rate > 0.0 {
                0.5
            } else {
                0.0
            }
        } else {
            // 最新のいくつかの時間の傾向を分析
            let latest_hours: Vec<_> = sorted_hours
                .iter()
                .filter(|&(hour, _)| current_hour.saturating_sub(**hour) < hours_to_compare)
                .collect();

            if latest_hours.len() < 3 {
                if growth_rate > 0.0 {
                    0.5
                } else {
                    0.0
                }
            } else {
                // 最新時間の傾きを計算
                let mut sum_slope = 0.0;
                let mut count = 0;

                for i in 1..latest_hours.len() {
                    let (_, current_count) = latest_hours[i];
                    let (_, prev_count) = latest_hours[i - 1];

                    if **prev_count > 0 {
                        let slope =
                            (**current_count as f64 - **prev_count as f64) / **prev_count as f64;

                        sum_slope += slope;
                        count += 1;
                    }
                }

                // 平均傾きをモメンタムとして使用
                if count > 0 {
                    (sum_slope / count as f64).max(-1.0).min(2.0)
                } else {
                    if growth_rate > 0.0 {
                        0.5
                    } else {
                        0.0
                    }
                }
            }
        };

        (growth_rate, momentum)
    }

    /// 総合統計を組み合わせる
    fn combine_stats(&self, base_stats: TotalStats, recent_stats: TotalStats) -> TotalStats {
        // 両方のデータを結合
        let total_views = base_stats.total_views + recent_stats.total_views;

        // ユニークユーザーは重複があるため単純な加算はしない
        // 推定重複率を0.25として計算
        let unique_users = ((base_stats.unique_users as f64).max(1.0) * 0.75
            + (recent_stats.unique_users as f64).max(1.0) * 0.75) as u32;

        // 成長率とモメンタムは最近のデータを優先
        let growth_rate = if recent_stats.growth_rate != 0.0 {
            recent_stats.growth_rate
        } else {
            base_stats.growth_rate
        };

        let momentum = if recent_stats.momentum != 0.0 {
            recent_stats.momentum
        } else {
            base_stats.momentum
        };

        // エンゲージメントは最近のデータのみ有効
        let engagement = recent_stats.engagement;

        TotalStats {
            total_views,
            unique_users,
            growth_rate,
            momentum,
            engagement,
        }
    }
}

/// 統計情報の集計結果を表す構造体
#[derive(Default, Debug)]
struct TotalStats {
    total_views: u32,  // 総閲覧数
    unique_users: u32, // ユニークユーザー数
    growth_rate: f64,  // 成長率
    momentum: f64,     // 勢い
    engagement: f64,   // エンゲージメント
}

/// イベントタイプごとの重み付け情報
#[derive(Default, Debug)]
struct EventWeights {
    like_ratio: f64,      // いいねの比率
    comment_ratio: f64,   // コメントの比率
    bookmark_ratio: f64,  // 本棚追加の比率
    quality_factor: f64,  // 高品質エンゲージメント因子
}

// JavaScriptからログ関数を受け取るためのグローバル関数を定義
#[wasm_bindgen(start)]
pub fn main() {
    // WASM初期化時に実行される処理
}

// Rust側からJavaScriptのlog_wasm_calculationを呼び出すためのヘルパー
#[wasm_bindgen]
pub fn test_log(post_id: u32, message: &str) {
    log_wasm_calculation(post_id, "test", message, "{}");
}