#pragma strict
var projectile : GameObject;
function Start () {

}

function Update () {
	if(Input.GetButtonDown("Jump")){
		Instantiate(projectile, transform.position, transform.rotation);
	
	}
}