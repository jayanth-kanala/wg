apk add docker nginx certbot-nginx

# nginx config
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
# 		proxy_set_header Host $host;
# 		proxy_set_header X-Real-IP $remote_addr;
# 		proxy_set_header X-Forwarded-Proto $scheme;
# 		proxy_pass http://[::]:51821;
# 	}

# docker config
# https://docs.docker.com/config/daemon/ipv6/
vim /etc/docker/daemon.json
{
	"ipv6": true,
	"fixed-cidr-v6": "fde4:5bc0:bb7::/64"
}

certbot --nginx

# update in wg.conf
vim /etc/nginx/sites-available/wg.conf
listen [::]:443 ssl ipv6only=on http2; # managed by Certbot
# comment this
# listen 443 ssl; # managed by Cerbot

rc-update add docker
rc-update add nginx
service docker start
service nginx start

 docker run -d \
 --name ipv6nat \
 --cap-add=NET_ADMIN \
 --cap-add=SYS_MODULE \
 --network host \
 --restart unless-stopped \
 -v /var/run/docker.sock:/var/run/docker.sock:ro \
 -v /lib/modules:/lib/modules:ro \
 robbertkl/ipv6nat

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
 --sysctl="net.ipv6.conf.all.disable_ipv6=0" \
 --sysctl="net.ipv6.conf.all.forwarding=1" \
 --sysctl="net.ipv6.conf.all.accept_ra=2" \
 --restart unless-stopped \
 winefish/wine-wg