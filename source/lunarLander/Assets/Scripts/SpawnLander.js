/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/

#pragma strict
#pragma implicit
#pragma downcast

public var playerPrefab : Transform;

	
public function Spawn(newPlayer : NetworkPlayer, playerScripts : ArrayList){
	//Called on the server only
	
	var playerNumber : int = parseInt(newPlayer+"");
	//Instantiate a new object for this player, remember; the server is therefore the owner.
	var myNewTrans : Transform = Network.Instantiate(playerPrefab, transform.position, transform.rotation, playerNumber);
	
	//Get the networkview of this new transform
	var newObjectsNetworkview : NetworkView = myNewTrans.networkView;
	
	//Keep track of this new player so we can properly destroy it when required.
	playerScripts.Add(myNewTrans.GetComponent(PlayerController));
	
	//Call an RPC on this new networkview, set the player who controls this player
	newObjectsNetworkview.RPC("SetPlayer", RPCMode.AllBuffered, newPlayer);//Set it on the owner

	return playerScripts;
}