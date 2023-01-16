apk add htop docker ufw nginx dnscrypt-proxy dnscrypt-proxy-openrc

umask 077; mkdir /etc/nginx/sites-available; mkdir /etc/nginx/sites-enabled
// update /etc/nginx/nginx.conf
# Includes virtual hosts configs.
#include /etc/nginx/http.d/*.conf;

# Include virtual hosts configs.
include /etc/nginx/sites-enabled/*;

ufw allow ssh/tcp
ufw allow http
ufw allow https
rc-update add docker
rc-update add nginx
rc-update add dnscrypt-proxy
service docker start
service nginx start

docker run -d \
 --name=wine-wg \
 -e PASSWORD="REPLACE_PASSWORD" \
 -e WG_HOST="REPLACE_HOSTNAME" \
 -e WG_DEFAULT_DNS="REPLACE_DNS" \
 -v ~/.wg:/etc/wireguard \
 -p 51820:51820/udp \
 -p 51821:51821/tcp \
 --cap-add=NET_ADMIN \
 --cap-add=SYS_MODULE \
 --sysctl="net.ipv4.ip_forward=1" \
 --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
 --restart unless-stopped \
 winefish/wine-wg