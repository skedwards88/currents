import React from "react";
import InstallOverview from "@skedwards88/shared-components/src/components/InstallOverview";
import PWAInstall from "@skedwards88/shared-components/src/components/PWAInstall";
import MoreGames from "@skedwards88/shared-components/src/components/MoreGames";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import {useInstallPrompt} from "@skedwards88/shared-components/src/logic/handleInstall";
import {gameReducer} from "../logic/gameReducer";
import {gameInit} from "../logic/gameInit";
import Game from "./Game";

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
    {},
    gameInit,
  );

  switch (display) {
    case "heart":
      return (
        <MoreGames
          setDisplay={setDisplay}
          games={["crossjig", "lexlet", "wordfall", "gribbles", "logicGrid"]}
          repoName={"currents"}
          includeExtraInfo={true}
          includeWordAttribution={false}
        ></MoreGames>
      );

    case "rules":
      return <div>TODO</div>;

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
          remainingSweeps={gameState.remainingSweeps}
          puzzleHistory={gameState.puzzleHistory}
          setDisplay={setDisplay}
          dispatchGameState={dispatchGameState}
        ></Game>
      );
  }
}
