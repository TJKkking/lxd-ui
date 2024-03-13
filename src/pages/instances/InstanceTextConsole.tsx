import { FC, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FitAddon } from "xterm-addon-fit";
import {
  connectInstanceConsole,
  fetchInstanceConsoleBuffer,
} from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import Loader from "components/Loader";
import useEventListener from "@use-it/event-listener";
import { LxdInstance } from "types/instance";
import { updateMaxHeight } from "util/updateMaxHeight";
import { unstable_usePrompt as usePrompt } from "react-router-dom";
import Xterm from "components/Xterm";
import { Terminal } from "xterm";
import { useNotify } from "@canonical/react-components";
import { useTranslation } from "react-i18next";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown, message?: string) => void;
  showNotRunningInfo: () => void;
}

const InstanceTextConsole: FC<Props> = ({
  instance,
  onFailure,
  showNotRunningInfo,
}) => {
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();
  const textEncoder = new TextEncoder();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [textBuffer, setTextBuffer] = useState("");
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [fitAddon] = useState<FitAddon>(new FitAddon());
  const [userInteracted, setUserInteracted] = useState(false);
  const xtermRef = useRef<Terminal>(null);
  const notify = useNotify();
  const { t } = useTranslation();

  usePrompt({
    when: userInteracted,
    message: t("are-you-sure-you-want-to-leave-this-page"),
  });

  const handleCloseTab = (e: BeforeUnloadEvent) => {
    if (userInteracted) {
      e.returnValue = t("are-you-sure-you-want-to-leave-this-page");
    }
  };
  useEventListener("beforeunload", handleCloseTab);

  const isRunning = instance.status === t("running");

  const handleError = (e: object) => {
    onFailure(t("error"), e);
  };

  const openWebsockets = async () => {
    if (!name) {
      onFailure(t("missing-name"), new Error());
      return;
    }
    if (!project) {
      onFailure(t("missing-project"), new Error());
      return;
    }

    setLoading(true);
    fetchInstanceConsoleBuffer(name, project)
      .then(setTextBuffer)
      .catch(console.error);
    const result = await connectInstanceConsole(name, project).catch((e) => {
      setLoading(false);
      if (isRunning) {
        onFailure(t("connection-failed"), e);
      } else {
        showNotRunningInfo();
      }
    });
    if (!result) {
      return;
    }

    const operationUrl = result.operation.split("?")[0];
    const dataUrl = `wss://${location.host}${operationUrl}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `wss://${location.host}${operationUrl}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const data = new WebSocket(dataUrl);
    const control = new WebSocket(controlUrl);

    control.onopen = () => {
      setLoading(false);
    };

    control.onerror = handleError;

    control.onclose = (event) => {
      if (1005 !== event.code) {
        onFailure(t("error"), event.reason, getWsErrorMsg(event.code));
      }
    };

    data.onopen = () => {
      setDataWs(data);
    };

    data.onerror = handleError;

    data.onclose = (event) => {
      if (1005 !== event.code) {
        onFailure(t("error"), event.reason, getWsErrorMsg(event.code));
      }
      setDataWs(null);
      setUserInteracted(false);
    };

    data.binaryType = "arraybuffer";
    data.onmessage = (message: MessageEvent<ArrayBuffer>) => {
      xtermRef.current?.write(new Uint8Array(message.data));
    };

    return [data, control];
  };

  useEffect(() => {
    if (isRunning) {
      xtermRef.current?.focus();
    }
  }, [isRunning]);

  useEffect(() => {
    if (dataWs) {
      return;
    }
    notify.clear();
    const websocketPromise = openWebsockets();
    return () => {
      void websocketPromise.then((websockets) => {
        websockets?.map((websocket) => websocket.close());
      });
    };
  }, [fitAddon, instance.status]);

  useEffect(() => {
    if (!textBuffer || !xtermRef.current || isLoading) {
      return;
    }
    xtermRef.current.write(textBuffer);
    setTextBuffer("");
  }, [textBuffer, isLoading]);

  const handleResize = () => {
    updateMaxHeight("p-terminal", undefined, 10);

    xtermRef.current?.element?.style.setProperty("padding", "1rem");
    fitAddon.fit();
  };

  // calling handleResize again after a timeout to fix a race condition
  // between updateMaxHeight and fitAddon.fit
  useEventListener("resize", () => {
    handleResize();
    setTimeout(handleResize, 500);
  });

  return (
    <>
      {isLoading ? (
        <Loader text={t("loading-text-console")} />
      ) : (
        <Xterm
          ref={xtermRef}
          addons={[fitAddon]}
          onData={(data) => {
            setUserInteracted(true);
            dataWs?.send(textEncoder.encode(data));
          }}
          className="p-terminal"
          onOpen={handleResize}
        />
      )}
    </>
  );
};

export default InstanceTextConsole;
