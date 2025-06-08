# ベースイメージとしてNode.jsを使用（LTSバージョン推奨）
FROM node:20.10.0

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピーして依存関係をインストール
COPY package.json .
RUN npm install

# ソースコードをすべてコピー
COPY . .

# コンテナが使用するポートを指定
EXPOSE 3000

# ビルドしたアプリケーションを提供
CMD ["npm", "start"]

