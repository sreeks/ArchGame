#pragma strict
@script ExecuteInEditMode() //show GUI in editor

var myGUISkin : GUISkin;

var btnWidth : int;

function OnGUI()
{
	GUI.skin = myGUISkin;
	
	if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2-20,btnWidth,30), "start new game!"))
	{
		PlayerPrefs.DeleteAll();
		Application.LoadLevel(1);
		print("starting new game!");
	}
	if(PlayerPrefs.HasKey("playerLevel"))
	{
		if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2+20,btnWidth,30), "continue saved game"))
		{
			Application.LoadLevel(PlayerPrefs.GetInt("playerLevel"));
			print("continue saved game...");
		}
	}
}