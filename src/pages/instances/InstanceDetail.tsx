import { FC } from "react";
import { Notification, Row, Strip } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useParams } from "react-router-dom";
import InstanceSnapshots from "./InstanceSnapshots";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import InstanceConsole from "pages/instances/InstanceConsole";
import InstanceLogs from "pages/instances/InstanceLogs";
import EditInstance from "./EditInstance";
import InstanceDetailHeader from "pages/instances/InstanceDetailHeader";
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";
import { i } from "vitest/dist/reporters-rzC174PQ";
import { useTranslation } from "react-i18next";

const InstanceDetail: FC = () => {
  const { t } = useTranslation();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>{t("missing-name")}</>;
  }
  if (!project) {
    return <>{t("missing-project")}</>;
  }

  const tabs: string[] = [
    t("overview"),
    t("configuration"),
    t("snapshots"),
    t("terminal"),
    t("console"),
    t("logs"),
  ];

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, name, project],
    queryFn: () => fetchInstance(name, project),
  });

  return (
    <CustomLayout
      header={
        <InstanceDetailHeader
          name={name}
          instance={instance}
          project={project}
        />
      }
      contentClassName="detail-page"
    >
      {isLoading && <Loader text={t("loading-instance-details")} />}
      {!isLoading && !instance && !error && <>{t("loading-instance-failed")}</>}
      {error && (
        <Strip>
          <Notification severity="negative" title={t("error")}>
            {error.message}
          </Notification>
        </Strip>
      )}
      {!isLoading && instance && (
        <Row>
          <TabLinks
            tabs={tabs}
            activeTab={activeTab}
            tabUrl={`/ui/project/${project}/instance/${name}`}
          />

          {!activeTab && (
            <div role="tabpanel" aria-labelledby="overview">
              <InstanceOverview instance={instance} />
            </div>
          )}

          {activeTab === t("configuration") && (
            <div role="tabpanel" aria-labelledby="configuration">
              <EditInstance instance={instance} />
            </div>
          )}

          {activeTab === t("snapshots") && (
            <div role="tabpanel" aria-labelledby="snapshots">
              <InstanceSnapshots instance={instance} />
            </div>
          )}

          {activeTab === t("terminal") && (
            <div role="tabpanel" aria-labelledby="terminal">
              <InstanceTerminal instance={instance} />
            </div>
          )}

          {activeTab === t("console") && (
            <div role="tabpanel" aria-labelledby="console">
              <InstanceConsole instance={instance} />
            </div>
          )}

          {activeTab === t("logs") && (
            <div role="tabpanel" aria-labelledby="logs">
              <InstanceLogs instance={instance} />
            </div>
          )}
        </Row>
      )}
    </CustomLayout>
  );
};

export default InstanceDetail;
