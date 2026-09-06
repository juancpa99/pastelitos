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

  const extraSection=[...root.querySelectorAll(".section")].find(section=>
    section.textContent.trim()==="Sesiones extra"
  );
  if(!extraSection)return;

  // The extra-session area ends immediately before the weekly secondary block.
  // Put the recovered-workout action after all extra-session cards, regardless of
  // whether there are already extras recorded for the selected day.
  let anchor=extraSection;
  let node=extraSection.nextElementSibling;
  while(node&&!node.classList.contains("workout-secondary")){
    if(node!==pendingCard)anchor=node;
    node=node.nextElementSibling;
  }

  if(anchor!==pendingCard&&anchor.nextElementSibling!==pendingCard){
    anchor.insertAdjacentElement("afterend",pendingCard);
  }
  pendingCard.classList.add("pending-workout-card");
}

const pendingLayoutRenderWorkout=renderWorkout;
renderWorkout=function(){
  pendingLayoutRenderWorkout();
  movePendingWorkoutCard();
};

movePendingWorkoutCard();
