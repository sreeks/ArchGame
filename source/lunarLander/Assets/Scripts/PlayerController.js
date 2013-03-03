#pragma strict

var bottomThruster : ParticleEmitter;
var topThruster : ParticleEmitter;
var leftThruster : ParticleEmitter;
var rightThruster : ParticleEmitter;
var shipExplosions : GameObject[];
var GUI : InGameGUI;

function Start () 
{
	GUI = GameObject.FindWithTag("GUI").GetComponent(InGameGUI);
}

function Update () 
{
	if(Input.GetAxis("Horizontal") > 0) //checking for right arrow key
	{
		rightThruster.emit = false;
		leftThruster.emit = true;
		rigidbody.AddForce(100,0,0);
	}
	if(Input.GetAxis("Horizontal") < 0) //checking for left arrow key
	{
		leftThruster.emit = false;
		rightThruster.emit = true;
		rigidbody.AddForce(-100,0,0);//updated force from -10 to 100
	}
	if(Input.GetAxis("Horizontal") == 0) //checking if no horizontal keys down
	{
		rightThruster.emit = false;
		leftThruster.emit = false;
	}
	
	
	if(Input.GetAxis("Vertical") > 0) //checking for up arrow key
	{
		topThruster.emit = false;
		bottomThruster.emit = true;
		rigidbody.AddForce(0,100,0);
	}
	if(Input.GetAxis("Vertical") < 0) //checking for down arrow key
	{
		bottomThruster.emit = false;
		topThruster.emit = true;
		rigidbody.AddForce(0,-100,0);
	}
	if(Input.GetAxis("Vertical") == 0) //checking if no vertical keys down
	{
		bottomThruster.emit = false;
		topThruster.emit = false;
	}
	
	if(Input.GetAxis("Vertical") != 0 || Input.GetAxis("Horizontal") != 0)
	{
		if(!audio.isPlaying)
		{
			print("playing engine effect!");
			audio.Play();
		}
	}
	else if(audio.isPlaying)
	{
		print("stopping engine effect!");
		audio.Stop();
	}
}

function OnCollisionEnter(hitInfo : Collision) //uho, the ship hit something!
{
	if(hitInfo.relativeVelocity.magnitude >= 2) //if we hit it too hard, explode!
	{
		Explode();
	}
	else if(hitInfo.gameObject.tag == "LandingPad")
	{
		var landingPad : LandingPad; //the script on the landing pad
		landingPad = hitInfo.gameObject.GetComponent("LandingPad");
		landingPad.Activate();		
	}
	else if(hitInfo.gameObject.tag == "Mothership")
	{
		var mothership : Mothership; //the script on the mothership
		mothership = hitInfo.gameObject.GetComponent("Mothership");
		mothership.Activate();		
	}
}

function Explode() //Drop in a random explosion effect, and destroy ship
{	
	var randomNumber : int = Random.Range(0,shipExplosions.length);
	Instantiate(shipExplosions[randomNumber], transform.position, transform.rotation);
	Destroy(gameObject);
	
	GUI.Lose();
}