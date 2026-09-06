// Keep recovered workouts next to the extra-session controls instead of at the top of Entreno.
function movePendingWorkoutCard(){
  const root=document.getElementById("viewWorkout");
  if(!root)return;

  const pendingButton=[...root.querySelectorAll("button")].find(button=>
    (button.getAttribute("onclick")||"").includes("openPendingWorkouts")
  );
  if(!pendingButton)return;

  const pendingCard=pendingButton.closest(".card");
  if(!pendingCard)return;

  const extraButtons=[...root.querySelectorAll("button")].filter(button=>
    (button.getAttribute("onclick")||"").includes("openExtraSession")
  );
  const extraAnchor=extraButtons.at(-1);
  if(!extraAnchor)return;

  const target=extraAnchor.closest(".card")||extraAnchor;
  if(target===pendingCard)return;
  target.insertAdjacentElement("afterend",pendingCard);
  pendingCard.classList.add("pending-workout-card");
}

const pendingLayoutRenderWorkout=renderWorkout;
renderWorkout=function(){
  pendingLayoutRenderWorkout();
  movePendingWorkoutCard();
};

movePendingWorkoutCard();
