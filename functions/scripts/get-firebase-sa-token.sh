#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYFILE="${1:-$SCRIPT_DIR/../eu-desenvolvo.json}"
if [[ ! -f "$KEYFILE" ]]; then
  echo "Error: service account key not found at $KEYFILE" >&2
  exit 1
fi
assertion=$(python3 - "$KEYFILE" <<'PY'
import json, base64, time, subprocess, tempfile, os, sys
KEYFILE = sys.argv[1]
with open(KEYFILE) as f:
    d = json.load(f)
header = base64.urlsafe_b64encode(json.dumps({'alg': 'RS256', 'typ': 'JWT'}).encode()).decode().rstrip('=')
claim = {
    'iss': d['client_email'],
    'scope': 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
    'aud': 'https://oauth2.googleapis.com/token',
    'exp': int(time.time()) + 3600,
    'iat': int(time.time()),
}
payload = base64.urlsafe_b64encode(json.dumps(claim, separators=(',', ':')).encode()).decode().rstrip('=')
message = f'{header}.{payload}'
with tempfile.NamedTemporaryFile('w', delete=False) as keyfile:
    keyfile.write(d['private_key'])
    keypath = keyfile.name
try:
    p = subprocess.Popen(['openssl', 'dgst', '-sha256', '-sign', keypath], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    sig, _ = p.communicate(message.encode())
    if p.returncode != 0:
        raise SystemExit('OpenSSL signing failed')
    signature = base64.urlsafe_b64encode(sig).decode().rstrip('=')
    print(f'{message}.{signature}')
finally:
    os.unlink(keypath)
PY
)
curl -s -X POST https://oauth2.googleapis.com/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
  --data-urlencode "assertion=$assertion" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data["access_token"])'
