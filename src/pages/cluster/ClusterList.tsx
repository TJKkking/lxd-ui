import { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { fetchClusterMembers } from "api/cluster";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import ClusterGroupSelector from "pages/cluster/ClusterGroupSelector";
import { useParams } from "react-router-dom";
import EditClusterGroupBtn from "pages/cluster/actions/EditClusterGroupBtn";
import DeleteClusterGroupBtn from "pages/cluster/actions/DeleteClusterGroupBtn";
import ScrollableTable from "components/ScrollableTable";
import {
  allClusterGroups,
  getClusterHeaders,
  getClusterRows,
} from "util/clusterGroups";
import { useSettings } from "context/useSettings";
import NotificationRow from "components/NotificationRow";
import { isClusteredServer } from "util/settings";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import { useTranslation } from "react-i18next";

const ClusterList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { group: activeGroup } = useParams<{ group: string }>();
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);

  const { t } = useTranslation();

  const {
    data: members = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
    enabled: isClustered,
  });

  if (error) {
    notify.failure(t("loading-cluster-members-failed"), error);
  }

  const filteredMembers = members.filter(
    (member) => !activeGroup || member.groups?.includes(activeGroup),
  );

  const headers = getClusterHeaders(activeGroup);
  const rows = getClusterRows(filteredMembers, activeGroup);
  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  return (
    <BaseLayout
      mainClassName="cluster-list"
      contentClassName="cluster-content"
      title={
        <HelpLink
          href={`${docBaseLink}/explanation/clustering/`}
          title={t("learn-more-about-clustering")}
        >
          {isClustered ? (
            <ClusterGroupSelector
              activeGroup={activeGroup ?? allClusterGroups}
              key={activeGroup}
            />
          ) : (
            t("cluster")
          )}
        </HelpLink>
      }
      controls={
        activeGroup ? <EditClusterGroupBtn group={activeGroup} /> : null
      }
    >
      <NotificationRow />
      <Row>
        {isClustered && filteredMembers.length > 0 && (
          <>
            <ScrollableTable
              dependencies={[filteredMembers, notify.notification]}
              tableId="cluster-table"
              belowIds={["status-bar"]}
            >
              <TablePagination
                data={sortedRows}
                id="pagination"
                itemName={t("cluster-member")}
                className="u-no-margin--top"
                aria-label={t("table-pagination-control")}
              >
                <MainTable
                  id="cluster-table"
                  headers={headers}
                  sortable
                  onUpdateSort={updateSort}
                  emptyStateMsg={
                    isLoading && <Loader text={t("loading-cluster-members")} />
                  }
                />
              </TablePagination>
            </ScrollableTable>
          </>
        )}
        {!isLoading &&
          isClustered &&
          activeGroup &&
          filteredMembers.length < 1 && (
            <EmptyState
              className="empty-state"
              image={<Icon name="machines" className="empty-state-icon" />}
              title={t("cluster-group-empty")}
            >
              <p>{t("add-cluster-members-to-this-group")}</p>
              <p>
                <a
                  href={`${docBaseLink}/explanation/clustering/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("learn-more-about-clustering")}
                  <Icon className="external-link-icon" name="external-link" />
                </a>
              </p>
              <DeleteClusterGroupBtn group={activeGroup} />
            </EmptyState>
          )}
        {!isClustered && (
          <EmptyState
            className="empty-state"
            image={<Icon name="machines" className="empty-state-icon" />}
            title={t("this-server-is-not-clustered")}
          >
            <p>
              {t(
                "creating-cluster-members-is-not-supported-in-lxd-ui-create-one-using-lxd-cli",
              )}
            </p>
            <p>
              <a
                href={`${docBaseLink}/explanation/clustering/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("learn-more-about-clustering")}
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
          </EmptyState>
        )}
      </Row>
    </BaseLayout>
  );
};

export default ClusterList;
