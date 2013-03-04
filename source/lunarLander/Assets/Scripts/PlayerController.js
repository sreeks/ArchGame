#pragma strict

var bottomThruster : ParticleEmitter;
var topThruster : ParticleEmitter;
var leftThruster : ParticleEmitter;
var rightThruster : ParticleEmitter;
var shipExplosions : GameObject[];
var GUI : InGameGUI;
public var owner : NetworkPlayer;

function Start () 
{
	GUI = GameObject.FindWithTag("GUI").GetComponent(InGameGUI);
}

//Last input value, we're saving this to save network messagesbandwidth.
private var lastClientHInput : float=0;
private var lastClientVInput : float=0;

//The input values the server will execute on this object
private var serverCurrentHInput : float = 0;
private var serverCurrentVInput : float = 0;


function Awake(){
	// We are probably not the owner of this object: disable this script.
	// RPC's and OnSerializeNetworkView will STILL get trough!
	// The server ALWAYS run this script though
	if(Network.isClient){
		enabled=false;	 // disable this script (this enables Update());	
	}	
}


@RPC
function SetPlayer(player : NetworkPlayer){
	owner = player;
	if(player==Network.player){
		//Hey thats us! We can control this player: enable this script (this enables Update());
		enabled=true;
	}
}

function FixedUpdate(){
	
	//Client code
	if(owner!=null && Network.player==owner){
		//Only the client that owns this object executes this code
		//Only the client that owns this object executes this code
		var HInput : float = Input.GetAxis("Horizontal");
		var VInput : float = Input.GetAxis("Vertical");
		
		//Is our input different? Do we need to update the server?
		if(lastClientHInput!=HInput || lastClientVInput!=VInput ){
			lastClientHInput = HInput;
			lastClientVInput = VInput;

		Debug.Log("HInput " + HInput + " VInput " + VInput);
		
		if(Network.isServer){
				//Too bad a server can't send an rpc to itself using "RPCMode.Server"!...bugged :[
				SendMovementInput(HInput, VInput);
			}else if(Network.isClient){
				//SendMovementInput(HInput, VInput); //Use this (and line 64) for simple "prediction"
				networkView.RPC("SendMovementInput", RPCMode.Server, HInput, VInput);
			}
		}
	}
	
	//Server movement code
	if(Network.isServer){//Also enable this on the client itself: "|| Network.player==owner){|"
		//Actually move the player using his/her input
		rightThruster = transform.Find("RightThruster").particleEmitter;
		leftThruster = transform.Find("LeftThruster").particleEmitter;
		topThruster = transform.Find("TopThruster").particleEmitter;
		bottomThruster = transform.Find("BottomThruster").particleEmitter;

		if(serverCurrentHInput > 0) //checking for right arrow key
		{
			rightThruster.emit = false;
			leftThruster.emit = true;
			transform.rigidbody.AddForce(100,0,0);
		}
		if(serverCurrentHInput < 0) //checking for left arrow key
		{
			leftThruster.emit = false;
			rightThruster.emit = true;
			transform.rigidbody.AddForce(-100,0,0);//updated force from -10 to 100
		}
		if(serverCurrentHInput == 0) //checking if no horizontal keys down
		{
			rightThruster.emit = false;
			leftThruster.emit = false;
		}
		
		
		if(serverCurrentVInput > 0) //checking for up arrow key
		{
			topThruster.emit = false;
			bottomThruster.emit = true;
			transform.rigidbody.AddForce(0,100,0);
		}
		if(serverCurrentVInput < 0) //checking for down arrow key
		{
			bottomThruster.emit = false;
			topThruster.emit = true;
			transform.rigidbody.AddForce(0,-100,0);
		}
		if(serverCurrentVInput == 0) //checking if no vertical keys down
		{
			bottomThruster.emit = false;
			topThruster.emit = false;
		}
		
		if(serverCurrentVInput != 0 || serverCurrentHInput != 0)
		{
			if(!transform.audio.isPlaying)
			{
				print("playing engine effect!");
				transform.audio.Play();
			}
		}
		else if(transform.audio.isPlaying)
		{
			print("stopping engine effect!");
			transform.audio.Stop();
		}
	}
	
}




@RPC
function SendMovementInput(HInput : float, VInput : float){	
	//Called on the server
	serverCurrentHInput = HInput;
	serverCurrentVInput = VInput;
}


function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo)
{
	if (stream.isWriting){
		//This is executed on the owner of the networkview
		//The owner sends it's position over the network
		
		var pos : Vector3 = transform.rigidbody.position;	
		var rot : Quaternion = transform.rigidbody.rotation;	
		var vel : Vector3 = transform.rigidbody.velocity;	
		var angVel : Vector3 = transform.rigidbody.angularVelocity;	
		stream.Serialize(pos);//"Encode" it, and send it
		stream.Serialize(rot);
		stream.Serialize(vel);
		stream.Serialize(angVel);
				
	}else{
		//Executed on all non-owners
		//This client receive a position and set the object to it
		
		var posReceive : Vector3 = Vector3.zero;	
		var rotReceive : Quaternion = Quaternion.identity;	
		var velReceive : Vector3 = Vector3.zero;		
		var angVelReceive : Vector3 = Vector3.zero;	
		stream.Serialize(posReceive); //"Decode" it and receive it
		stream.Serialize(rotReceive); 
		stream.Serialize(velReceive); 
		stream.Serialize(angVelReceive); 

		//We've just recieved the current servers position of this object in 'posReceive'.
		
		transform.rigidbody.position = posReceive;
		transform.rigidbody.rotation = rotReceive;
		transform.rigidbody.velocity = velReceive;	
		transform.rigidbody.angularVelocity = angVelReceive;
		//To reduce laggy movement a bit you could comment the line above and use position lerping below instead:	
		//transform.position = Vector3.Lerp(transform.position, posReceive, 0.9); //"lerp" to the posReceive by 90%
		
	}
}

function OnCollisionEnter(hitInfo : Collision) //uho, the ship hit something!
{
	if(hitInfo.relativeVelocity.magnitude >= 2) //if we hit it too hard, explode!
	{
		networkView.RPC("Explode", RPCMode.All);
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

@RPC
function Explode() //Drop in a random explosion effect, and destroy ship
{	
	var randomNumber : int = Random.Range(0,shipExplosions.length);
	Instantiate(shipExplosions[randomNumber], transform.position, transform.rotation);
	Destroy(gameObject);
	
	GUI.Lose();
}
