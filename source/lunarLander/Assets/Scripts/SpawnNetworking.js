/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/

#pragma strict
#pragma implicit
#pragma downcast

public var playerScripts : ArrayList = new ArrayList();
var LanderCreator : SpawnLander;

function OnServerInitialized(){
	LanderCreator = GameObject.FindWithTag("SpawnLander").GetComponent(SpawnLander);
	playerScripts = LanderCreator.Spawn(Network.player, playerScripts);
}

function OnPlayerConnected(newPlayer: NetworkPlayer) {
	//A player connected to me(the server)!
	LanderCreator = GameObject.FindWithTag("SpawnLander").GetComponent(SpawnLander);
	playerScripts = LanderCreator.Spawn(newPlayer, playerScripts);
}	

	
function OnPlayerDisconnected(player: NetworkPlayer) {
	Debug.Log("Clean up after player " + player);

	for(var script : PlayerController in playerScripts){
		if(player==script.owner){//We found the players object
			Network.RemoveRPCs(script.gameObject.networkView.viewID);//remove the bufferd SetPlayer call
			Network.Destroy(script.gameObject);//Destroying the GO will destroy everything
			playerScripts.Remove(script);//Remove this player from the list
			break;
		}
	}
	
	//Remove the buffered RPC call for instantiate for this player.
	var playerNumber : int = parseInt(player+"");
	Network.RemoveRPCs(Network.player, playerNumber);
	
	
	// The next destroys will not destroy anything since the players never
	// instantiated anything nor buffered RPCs
	Network.RemoveRPCs(player);
	Network.DestroyPlayerObjects(player);
}

function OnDisconnectedFromServer(info : NetworkDisconnection) {
	Debug.Log("Resetting the scene the easy way.");
	Application.LoadLevel(Application.loadedLevel);	
}
