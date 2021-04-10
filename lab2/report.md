# Отчет по Лабораторной работе №2

[Задание](https://docs.google.com/document/d/1j57X1SPrvxraoi_wRNqsh1adOUJXOdA392Es68WwASk/edit)

1. C помощью команды
   `ab -c 10 -n 100 http://localhost:8080/users`
   замерили скорость обработки запросов
   ![](https://api.monosnap.com/file/download?id=OPCOoUI5SELLBgfoRCOf7sGBRXROLr)

2. Запустили node-сервер на порте 8081, сконфигурировали nginx таким образом, чтобы он перенаправлял запросы на node-сервер:

```
events {}
http {
    server {
        listen 8080;
        location / {
            proxy_pass http://localhost:8081;
        }
    }
}
```

Замерили скорость работы после изменений. Увеличилось время ответа для 50-98% запросов, но уменьшилось для 99-100%.
![](https://api.monosnap.com/file/download?id=uuddQJnJpwNr9ijnnEqx8ZvklHEEsK)

3. Изменили конфигурацию nginx, настроили отдачу статического файла data.json, который использовался в предыдущей лабораторной для хранения данных.

```
events {}
http {
    server {
        listen 8080;
        location / {
            proxy_pass http://localhost:8081;
        }

        location /static/ {
            root /Users/skyeng/server/Web;
        }
    }
}
```

Замерили скорость после изменений командой `ab -c 10 -n 100 http://127.0.0.1/static/data.json`. Скорость до 98% запросов существенно ниже, чем скорость ответа node-сервера, но скорость 100% запросов выше:
![](https://api.monosnap.com/file/download?id=9eSQ6Am83lBh9LCzGnTXjPump9M3hd)

4. Добавили кэширование и сжатие статических файлов:

```
events {}
http {
    server {
        listen 8080;
        location / {
            proxy_pass http://localhost:8081;
        }

        location /static/ {
            root /Users/skyeng/server/Web;
            gzip on;
            zip_comp_level 5;
            expires 30d;
            add_header Vary Accept-Encoding;
        }

    }
}
```

Замерили скорость ответа после изменений. Скорость ответа до 98% запросов существенно не изменилась. Скорость ответа 100% запросов уменьшилась в несколько раз.

![](https://api.monosnap.com/file/download?id=nM0fAwB5wVX3D4uPt2Xv1l002Q7NZt)

5. Запустили node-сервер еще на двух портах: 8082 и 8083. Изменили конфигурацию nginx для балансировки запросов

```
events {}
http {
    server {
        listen 8080;
        location / {
            proxy_pass http://backend;
        }

        location /static/ {
            root /Users/skyeng/server/Web;
            gzip on;
            gzip_comp_level 5;
            expires 30d;
            add_header Vary Accept-Encoding;
        }

    }

    upstream backend {
        server 127.0.0.1:8081 weight=3;
        server 127.0.0.1:8082;
        server 127.0.0.1:8083;
    }
}
```

Измерили скорость ответов после изменений. Скорость ответа существенно уменьшилась.

![](https://api.monosnap.com/file/download?id=DQ95NgqGGzrxRqUoJ20Ob4NzWmUf3r)

6. Создали серверы service1.js и service2.js, которые предоставляют доступ к index1.html и index2.html, а также temp.html по адресу /temp. Запустили их на портах 8084 и 8085. Внесли изменения в конфигурацию nginx:

```
events {}
http {
    server {
        listen 8080;
        location / {
            proxy_pass http://backend;
        }

        location /service1/ {
            proxy_pass http://localhost:8084/;
        }

        location /service2/ {
            proxy_pass http://localhost:8085/;
        }

        location /static/ {
            root /Users/skyeng/server/Web;
            gzip on;
            gzip_comp_level 5;
            expires 30d;
            add_header Vary Accept-Encoding;
        }

    }

    upstream backend {
        server 127.0.0.1:8081 weight=3;
        server 127.0.0.1:8082;
        server 127.0.0.1:8083;
    }
}
```
