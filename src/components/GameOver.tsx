import React from "react";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import Share from "@skedwards88/shared-components/src/components/Share";
import logo from "../images/favicon/favicon_color_transparent.svg";
import {type ReducerPayload} from "../logic/gameReducer";
import {sendAnalyticsCF} from "@skedwards88/shared-components/src/logic/sendAnalyticsCF";
import {
  getFromStorage,
  saveToStorage,
} from "@skedwards88/shared-components/src/logic/safeStorage";

export default function GameOver({
  dispatchGameState,
  bonusLevelsComplete,
}: {
  dispatchGameState: React.Dispatch<ReducerPayload>;
  bonusLevelsComplete: boolean;
}): React.JSX.Element {
  const {userId, sessionId} = useMetadataContext();

  const [bonusUnlocked, setBonusUnlocked] = React.useState(
    getFromStorage<boolean>("currentsBonusUnlocked") ?? false,
  );

  React.useEffect(() => {
    saveToStorage("currentsBonusUnlocked", bonusUnlocked);
  }, [bonusUnlocked]);

  const congratsText = `Congratulations, you completed all of the ${bonusLevelsComplete ? "advanced" : "basic"} levels!`;

  return (
    <div id="gameOver" className="App info">
      <p>{congratsText}</p>
      <img src={logo} alt="Currents logo" id="logo" />
      <div>
        {!bonusLevelsComplete ? (
          <button
            disabled={!bonusUnlocked}
            onClick={() => dispatchGameState({action: "nextLevel"})}
          >
            Bonus
          </button>
        ) : (
          <></>
        )}
        <Share
          appName="Currents"
          text="Check out this puzzle!"
          url="https://currents.twistedtrailgames.com"
          origin="game_over"
          content="Share"
          userId={userId}
          sessionId={sessionId}
          onClickAddendum={() => setBonusUnlocked(true)}
        />
        <button onClick={() => dispatchGameState({action: "replay"})}>
          Replay
        </button>
      </div>
      {!bonusUnlocked ? (
        <p>Share with your friends to access the bonus levels</p>
      ) : (
        <></>
      )}
      <p>Check out more games at:</p>
      <a
        href="https://twistedtrailgames.com"
        onClick={() =>
          sendAnalyticsCF({
            userId,
            sessionId,
            analyticsToLog: [
              {eventName: "click_ttg_link", eventInfo: {origin: "game_over"}},
            ],
          })
        }
      >
        TwistedTrailGames.com
      </a>
    </div>
  );
}
