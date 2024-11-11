log() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

error() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') - ERROR: $1" >&2
  exit 1
}