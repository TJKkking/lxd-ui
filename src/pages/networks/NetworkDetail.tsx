import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useParams } from "react-router-dom";
import { fetchNetwork } from "api/networks";
import NotificationRow from "components/NotificationRow";
import EditNetwork from "pages/networks/EditNetwork";
import NetworkDetailHeader from "pages/networks/NetworkDetailHeader";
import Loader from "components/Loader";
import { Row } from "@canonical/react-components";
import NetworkDetailOverview from "pages/networks/NetworkDetailOverview";
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";
import NetworkForwards from "pages/networks/NetworkForwards";
import { useTranslation } from "react-i18next";

const NetworkDetail: FC = () => {
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  const { t } = useTranslation();

  const tabs: string[] = [t("overview"), t("configuration"), t("forwards")];

  if (!name) {
    return <>{t("missing-name")}</>;
  }

  if (!project) {
    return <>{t("missing-project")}</>;
  }

  const { data: network, isLoading } = useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networks, name],
    queryFn: () => fetchNetwork(name, project),
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <CustomLayout
      header={
        <NetworkDetailHeader network={network} project={project} name={name} />
      }
      contentClassName="edit-network"
    >
      <Row>
        <TabLinks
          tabs={network?.managed ? tabs : [t("overview")]}
          activeTab={activeTab}
          tabUrl={`/ui/project/${project}/network/${name}`}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            {network && <NetworkDetailOverview network={network} />}
          </div>
        )}
        {activeTab === t("configuration") && (
          <div role="tabpanel" aria-labelledby="configuration">
            {network && <EditNetwork network={network} project={project} />}
          </div>
        )}
        {activeTab === t("forwards") && (
          <div role="tabpanel" aria-labelledby="forwards">
            {network && <NetworkForwards network={network} project={project} />}
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkDetail;
