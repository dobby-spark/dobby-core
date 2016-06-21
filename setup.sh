CQLSH=`which cqlsh`;
if [[ "$CQLSH" == "" ]] ; then
	echo "please add cqlsh to your path"
	exit 1
fi

if [[ "$CONTACT_POINTS" == "" ]] ; then
	echo "please export CONTACT_POINTS for your cassandra host"
	exit 1
fi

$CQLSH -f cql/populateKeyspace.cql $CONTACT_POINTS $CANTACT_PORT; rc=$?

if [ $rc == 0 ] ; then
	echo "keyspace populated successfully"
else
	echo "failed to populate keyspace"
	exit 1
fi