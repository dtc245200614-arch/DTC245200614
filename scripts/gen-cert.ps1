# Generates a self-signed certificate into nginx/certs using a throwaway container (no local openssl needed)
$certs = Join-Path $PSScriptRoot '..\nginx\certs' | Resolve-Path
docker run --rm -v "${certs}:/certs" alpine/openssl req -x509 -nodes -newkey rsa:2048 -days 365 `
  -keyout /certs/selfsigned.key -out /certs/selfsigned.crt -subj "/C=VN/O=ExpenseTracker/CN=localhost" `
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
docker run --rm -v "${certs}:/certs" alpine chmod 644 /certs/selfsigned.key /certs/selfsigned.crt
