#pragma strict

var activatedMaterial : Material;
var activatedColor : Color;
var stationLight : Light;
var GUI : InGameGUI;

function Start () 
{
	GUI = GameObject.FindWithTag("GUI").GetComponent(InGameGUI);
}

function Activate()
{
	audio.Play();
	renderer.material = activatedMaterial;
	stationLight.color = activatedColor;
	GUI.LZActivated();
}