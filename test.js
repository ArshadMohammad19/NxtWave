const {MongoClient}=require('mongodb');


async function main(){
const url="mongodb+srv://jithendrakrishna:5FDG1l0jCO3LFC2Q@cluster0.a2obq1l.mongodb.net/?retryWrites=true&w=majority";
const client=new MongoClient(url);
try{
  await client.connect();
  await listDatabases(client);
}
catch(e){
  console.log(e);
}
finally{
  await client.close();
}
}

main();
async function listDatabases(client){
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
