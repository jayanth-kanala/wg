# https://www.golinuxcloud.com/linux-check-ipv6-enabled/#Check_if_IPv6_is_enabled_or_disabled
# https://www.digitalocean.com/community/tutorials/how-to-set-up-wireguard-on-ubuntu-22-04#step-2-choosing-ipv4-and-ipv6-addresses

## local ##############################
rm -rf ~/.wg
docker rm $(docker ps -qa) -f
docker rmi -f $(docker images -aq) -f

docker build . -t wine-wg
docker run -d \
 --name=wine-wg \
 -e PASSWORD="kk" \
 -e WG_HOST=winefish.duckdns.org \
 -v ~/.wg:/etc/wireguard \
 -p 51820:51820/udp \
 -p 51821:51821/tcp \
 --cap-add=NET_ADMIN \
 --cap-add=SYS_MODULE \
 --sysctl="net.ipv4.ip_forward=1" \
 --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
 --restart unless-stopped \
 wine-wg

## server ##############################
rm -rf ~/.wg
docker build . -t winefish/wine-wg
docker push winefish/wine-wg
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