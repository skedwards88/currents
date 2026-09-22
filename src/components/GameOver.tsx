import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import Share from "@skedwards88/shared-components/src/components/Share";
import logo from "../images/favicon/favicon_color_transparent.svg";
import {type ReducerPayload} from "../logic/gameReducer";
import {sendAnalyticsCF} from "@skedwards88/shared-components/src/logic/sendAnalyticsCF";

export default function GameOver({
  dispatchGameState,
}: {
  dispatchGameState: React.Dispatch<ReducerPayload>;
}): React.JSX.Element {
  const {userId, sessionId} = useMetadataContext();

  return (
    <div id="gameOver" className="App info">
      <p>Congratulations, you won!</p>
      <img src={logo} alt="Currents logo" id="logo" />
      <div>
        <Share
          appName="Currents"
          text="Check out this puzzle!"
          url="https://currents.twistedtrailgames.com"
          origin="game_over"
          content="Share"
          userId={userId}
          sessionId={sessionId}
        />
        <button onClick={() => dispatchGameState({action: "replay"})}>
          Replay
        </button>
      </div>

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
