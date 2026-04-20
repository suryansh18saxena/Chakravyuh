// geolocate.js
async function geolocateIp(ip) {
  // Return mock for local IPs
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
    return {
      country: "Local",
      city: "Localhost",
      lat: 0,
      lon: 0,
      isp: "Local ISP",
      proxy: false
    };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,lat,lon,isp,proxy`);
    const data = await res.json();
    if (data.status === "success") {
      return {
        country: data.country,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        isp: data.isp,
        proxy: data.proxy
      };
    }
  } catch (error) {
    console.error("Geolocation Error for IP", ip, error.message);
  }

  return {
    country: "Unknown",
    city: "Unknown",
    lat: 0,
    lon: 0,
    isp: "Unknown",
    proxy: false
  };
}

module.exports = { geolocateIp };
