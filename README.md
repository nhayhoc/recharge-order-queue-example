## Solve ?

- Bug
  - 2 ng cùng mua 1 sản phẩm
  - 1 người cố tình gian lận = cách tạo nhiều request mua => Bug trừ tiền 1 lần
- Solve: Queue 1 luồng
  - Nạp tiền
  - Thanh toán đơn hàng

## How to run example

### Create .env

```sh
PORT=3000
```

### Run docker

```sh
docker build -f Dockerfile.dev -t queue-test .
docker-compose up
```
