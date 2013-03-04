#pragma strict
@script ExecuteInEditMode() //show GUI in editor

var gameActive : boolean = true;
var guiMode : String = "InGame";

var numActivated : int;
var totalLZ : int;

var winClip : AudioClip;
var loseClip : AudioClip;

var levelScore : int;
var scoreText : GUIText;
var totalScoreText : GUIText;

var titleTexture : GUITexture;

var successTexture : Texture2D;
var failureTexture : Texture2D;

var successColor : Color;
var failureColor : Color;

var myGUISkin : GUISkin;

var btnWidth : int;

function Update()
{
	if(gameActive)
	{
		if(Input.GetKeyDown("escape"))
		{
			guiMode = "PauseMenu";
			gameActive = false;
			Time.timeScale = 0;
		}
	}
}

function OnGUI()
{
	GUI.skin = myGUISkin;

	if (Network.peerType == NetworkPeerType.Client){
		if(guiMode == "PauseMenu")
		{
			if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2-20,btnWidth,30), "resume game"))
			{
				Time.timeScale = 1;
				gameActive = true;
				guiMode = "InGame";
				print("resuming game");
			}
			if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2+20,btnWidth,30), "quit to main menu"))
			{
				Time.timeScale = 1;
				Application.LoadLevel(0);
				print("quiting to main menu");
			}
		}
		if(guiMode == "Win")
		{
			if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2-20,btnWidth,30), "next level!"))
			{
				Time.timeScale = 1;
				Application.LoadLevel(Application.loadedLevel+1);
				print("on to the next level!");
			}
			if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2+20,btnWidth,30), "quit to main menu"))
			{
				Time.timeScale = 1;
				Application.LoadLevel(0);
				print("quiting to main menu");
			}
		}
		if(guiMode == "Lose")
		{
			if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2-20,btnWidth,30), "retry level"))
			{
				Time.timeScale = 1;
				Application.LoadLevel(Application.loadedLevel);
				print("Retrying level...");
			}
			if(GUI.Button(Rect(Screen.width/2-(btnWidth/2),Screen.height/2+20,btnWidth,30), "quit to main menu"))
			{
				Time.timeScale = 1;
				Application.LoadLevel(0);
				print("quiting to main menu");
			}
		}
	}
}

function LZActivated()
{
	levelScore += 500;
	scoreText.text = "score - "+levelScore;
	numActivated++;
	if(numActivated == totalLZ)
	{
		Win();
	}
}

function Win()
{
	titleTexture.texture = successTexture;
	titleTexture.color = successColor;
	titleTexture.enabled = true;

	audio.clip = winClip;
	audio.Play();
	
	PlayerPrefs.SetInt("playerLevel", Application.loadedLevel+1);
	if(PlayerPrefs.HasKey("playerTotalScore"))
		PlayerPrefs.SetInt("playerTotalScore", levelScore+PlayerPrefs.GetInt("playerTotalScore"));
	else
		PlayerPrefs.SetInt("playerTotalScore", levelScore);
	PlayerPrefs.Save();
	
	totalScoreText.text = "total score = "+PlayerPrefs.GetInt("playerTotalScore");
	totalScoreText.enabled = true;
	
	Time.timeScale = 0;
	guiMode = "Win";
}

function Lose()
{
	titleTexture.texture = failureTexture;
	titleTexture.color = failureColor;
	titleTexture.enabled = true;
	
	yield(WaitForSeconds(3));
	audio.clip = loseClip;
	audio.Play();
	Time.timeScale = 0;
	guiMode = "Lose";
}