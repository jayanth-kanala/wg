apk add docker nginx htop certbot-nginx

umask 077; mkdir /etc/nginx/sites-available; mkdir /etc/nginx/sites-enabled

cp /etc/nginx/http.d/default.conf /etc/nginx/sites-available/wg.conf

vim /etc/nginx/nginx.conf

# Includes virtual hosts configs. comment below
#include /etc/nginx/http.d/*.conf;
# Include virtual hosts configs. add this
include /etc/nginx/sites-enabled/*;
ln -s /etc/nginx/sites-available/wg.conf /etc/nginx/sites-enabled/wg.conf

# add proxy to backend server
vim /etc/nginx/sites-available/wg.conf
# add server_name winefish.duckdns.org
# location / {
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#     proxy_pass http://localhost:51821;
# }
certbot --nginx

rc-update add docker
rc-update add nginx
service docker start
service nginx start

docker run -d \
 --name=wine-wg \
 -e PASSWORD="" \
 -e WG_HOST="" \
 -e WG_DEFAULT_DNS="" \
 -v ~/.wg:/etc/wireguard \
 -p 51820:51820/udp \
 -p 51821:51821/tcp \
 --cap-add=NET_ADMIN \
 --cap-add=SYS_MODULE \
 --sysctl="net.ipv4.ip_forward=1" \
 --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
 --restart unless-stopped \
 winefish/wine-wg