import React from "react";
import InstallOverview from "@skedwards88/shared-components/src/components/InstallOverview";
import PWAInstall from "@skedwards88/shared-components/src/components/PWAInstall";
import MoreGames from "@skedwards88/shared-components/src/components/MoreGames";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import {useInstallPrompt} from "@skedwards88/shared-components/src/logic/handleInstall";
import {gameReducer} from "../logic/gameReducer";
import {gameInit} from "../logic/gameInit";
import Game from "./Game";
import {saveToStorage} from "@skedwards88/shared-components/src/logic/safeStorage";
import {inferEventsToLog} from "../logic/inferEventsToLog";
import {sendAnalyticsCF} from "@skedwards88/shared-components/src/logic/sendAnalyticsCF";

export type DisplayState =
  "heart" | "rules" | "installOverview" | "pwaInstall" | "game";

export default function App(): React.JSX.Element {
  const {userId, sessionId} = useMetadataContext();

  // This must live at the top level component, not in InstallOverview where it is used, since the InstallOverview is not rendered initially and therefore misses its chance to attach the listeners
  const {installPromptEvent, showInstallButton, handleInstall} =
    useInstallPrompt({userId, sessionId});

  const [display, setDisplay] = React.useState<DisplayState>("game");

  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    {useSaved: true},
    gameInit,
  );

  React.useEffect(() => {
    saveToStorage("currentsSavedState", gameState);
  }, [gameState]);

  // Store the previous state so that we can infer which analytics events to send
  const previousGameStateRef = React.useRef(gameState);

  // Send analytics following reducer updates, if needed
  React.useEffect(() => {
    const previousState = previousGameStateRef.current;

    const analyticsToLog = inferEventsToLog(previousState, gameState);

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousGameStateRef.current = gameState;
  }, [gameState, sessionId, userId]);

  switch (display) {
    case "heart":
      return (
        <MoreGames
          setDisplay={setDisplay}
          games={["deepSpaceSlime", "crossjig", "lexlet"]}
          repoName={"currents"}
          includeExtraInfo={true}
          includeWordAttribution={false}
          userId={userId}
          sessionId={sessionId}
        ></MoreGames>
      );

    case "rules":
      return (
        <div className="App info">
          <p>
            We&apos;re not sure if this game needs rules. If you clicked here
            hoping for guidance, please let us know at
            TwistedTrailGames@gmail.com! Thanks for being an early playtester.
          </p>
          <button onClick={() => setDisplay("game")}>Close</button>
        </div>
      );

    case "installOverview":
      return (
        <InstallOverview
          setDisplay={setDisplay}
          userId={userId}
          sessionId={sessionId}
          installPromptEvent={installPromptEvent}
          showInstallButton={showInstallButton}
          handleInstall={handleInstall}
        ></InstallOverview>
      );

    case "pwaInstall":
      return (
        <PWAInstall
          setDisplay={setDisplay}
          pwaLink={"https://currents.twistedtrailgames.com"}
          userId={userId}
          sessionId={sessionId}
        ></PWAInstall>
      );

    default:
      return (
        <Game
          remainingSwipes={gameState.remainingSwipes}
          fishHistory={gameState.fishHistory}
          puzzle={gameState.puzzle}
          setDisplay={setDisplay}
          dispatchGameState={dispatchGameState}
          level={gameState.level}
        ></Game>
      );
  }
}
