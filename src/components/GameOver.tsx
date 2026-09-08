import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import Share from "@skedwards88/shared-components/src/components/Share";
import logo from "../images/favicon/favicon_color.svg";
import {type ReducerPayload} from "../logic/gameReducer";

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
      <Share
        appName="Currents"
        text="Check out this puzzle!"
        url="https://currents.twistedtrailgames.com"
        origin="game over"
        content="Share"
        userId={userId}
        sessionId={sessionId}
      />
      <button onClick={() => dispatchGameState({action: "replay"})}>
        Replay
      </button>
      <p>Check out more games at:</p>
      <a href="https://currents.twistedtrailgames.com">TwistedTrailGames.com</a>
    </div>
  );
}
