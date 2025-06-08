# ベースイメージとしてNode.jsの最新LTSバージョンを使用
FROM node:20.10.0 as builder

# Rustとwasm-packの依存関係をインストール
RUN apt-get update && apt-get install -y curl build-essential pkg-config libssl-dev

# Rustをインストール
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# wasm-packをインストール
RUN cargo install wasm-pack

# コンテナ内で作業するディレクトリを設定
WORKDIR /usr/src/app

# パッケージファイルをコピーして依存関係をインストール
COPY package.json package-lock.json ./
RUN npm install

# ソースコードをすべてコピー
COPY . .

# WASMモジュールをビルド
RUN mkdir -p /usr/src/app/wasm/pkg
RUN cd wasm && wasm-pack build --target nodejs

# 実行用の最終イメージ
FROM node:20.10.0-slim

# 必要なランタイム依存関係
RUN apt-get update && apt-get install -y libssl-dev

# コンテナ内で作業するディレクトリを設定
WORKDIR /usr/src/app

# ビルド済みのnpmモジュールとwasmパッケージをコピー
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/wasm/pkg ./wasm/pkg

# ソースコードをコピー（wasmのビルドディレクトリは除く）
COPY . .
RUN rm -rf ./wasm/target || true

# コンテナが使用するポート
EXPOSE 5000

# アプリケーションを起動
CMD [ "node", "server.js" ]