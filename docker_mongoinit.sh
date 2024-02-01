# docker_mongoinit.sh
set -e
mongosh <<EOF
use $MONGODB_DB
db.createUser({
  user: '$MONGODB_USER',
  pwd:  '$MONGODB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$MONGODB_DB'
  }]
})
EOF
