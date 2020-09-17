
const { connect } = require('./db');

async function run() {
  const { connection } = await connect('simulation_results');
    
    const option = {
      'id': {
        $in: [
        "571701398",
        "571701446",
        "571701841",
        "571701876",
        "571701983",
        "571701985",
        "571701986",
        "571701988",
       ]
      } };
    const start = +new Date();
    const result = await connection.db.collection('s1').find(option).toArray();
    console.log(result);
	console.log(result.length, +new Date() - start);
    connection.close();
}

run();
