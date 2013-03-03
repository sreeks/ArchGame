#pragma strict
var Speed : float;
var Turn : float; 
function Start () {

}

function Update () {

var players: GameObject[] = GameObject.FindGameObjectsWithTag("Player");
var closest: GameObject;
var closestDist = Mathf.Infinity;

  for (Player in players) {
  print(Player.name+" has been activated");
    var dist = (transform.position - Player.transform.position).sqrMagnitude; //Or Vector3.Distance
    
      if(dist < closestDist) {
      	closestDist = dist;
      	closest = Player;
        }
   }       
   
   transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(closest.transform.position), Turn*Time.deltaTime);
   transform.position += transform.forward*Speed*Time.deltaTime;
   
   }
   
   function OnCollisionEnter(collision : Collision) {
   	Destroy(gameObject);
   }