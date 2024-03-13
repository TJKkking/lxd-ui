import { FC } from "react";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenConsoleBtn from "./actions/OpenConsoleBtn";
import { List, useNotify } from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import { isNicDevice } from "util/devices";
import { Link } from "react-router-dom";
import InstanceStatusIcon from "./InstanceStatusIcon";
import { instanceCreationTypes } from "util/instanceOptions";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import InstanceLink from "pages/instances/InstanceLink";
import ItemName from "components/ItemName";
import DetailPanel from "components/DetailPanel";
import InstanceIps from "pages/instances/InstanceIps";
import { useSettings } from "context/useSettings";
import { useTranslation } from "react-i18next";

const RECENT_SNAPSHOT_LIMIT = 5;

const InstanceDetailPanel: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: settings } = useSettings();
  const { t } = useTranslation();

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, panelParams.instance, panelParams.project],
    queryFn: () =>
      fetchInstance(panelParams.instance ?? "", panelParams.project),
    enabled: panelParams.instance !== null,
  });

  if (error) {
    notify.failure(t("loading-instance-failed"), error);
  }

  const networkDevices = Object.values(instance?.expanded_devices ?? {}).filter(
    isNicDevice,
  );

  return (
    <DetailPanel
      title={t("instance-summary")}
      hasLoadingError={!instance}
      className="instance-detail-panel"
      isLoading={isLoading}
      actions={
        instance && (
          <div className="actions">
            <List
              inline
              className="primary actions-list"
              items={[
                <OpenTerminalBtn key="terminal" instance={instance} />,
                <OpenConsoleBtn key="console" instance={instance} />,
              ]}
            />
            <div className="state">
              <InstanceStateActions instance={instance} />
            </div>
          </div>
        )
      }
    >
      {instance && (
        <table className="u-table-layout--auto u-no-margin--bottom">
          <tbody>
            <tr>
              <th className="u-text--muted">{t("name")}</th>
              <td>
                <InstanceLink instance={instance} />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">{t("base-image")}</th>
              <td>
                <div
                  className="u-truncate base-image"
                  title={instance.config["image.description"]}
                >
                  {instance.config["image.description"] ?? "-"}
                </div>
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">{t("status")}</th>
              <td>
                <InstanceStatusIcon instance={instance} />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">{t("description")}</th>
              <td>{instance.description ? instance.description : "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">{t("type")}</th>
              <td>
                {
                  instanceCreationTypes.filter(
                    (item) => item.value === instance.type,
                  )[0].label
                }
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">IPv4</th>
              <td>
                <InstanceIps instance={instance} family="inet" />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">IPv6</th>
              <td>
                <InstanceIps instance={instance} family="inet6" />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">{t("architecture")}</th>
              <td>{instance.architecture}</td>
            </tr>
            <tr>
              <th className="u-text--muted">{t("location")}</th>
              <td>
                {settings?.environment?.server_clustered
                  ? instance.location
                  : "-"}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">{t("created")}</th>
              <td>{isoTimeToString(instance.created_at)}</td>
            </tr>
            <tr>
              <th className="u-text--muted last-used">{t("last-used")}</th>
              <td>{isoTimeToString(instance.last_used_at)}</td>
            </tr>
            <tr>
              <th>
                <h3 className="p-muted-heading p-heading--5">
                  <Link
                    to={`/ui/project/${instance.project}/instance/${instance.name}/configuration`}
                  >
                    {t("profiles")}
                  </Link>
                </h3>
              </th>
              <td>
                <List
                  className="list"
                  items={instance.profiles.map((name) => (
                    <Link
                      key={name}
                      to={`/ui/project/${instance.project}/profile/${name}`}
                    >
                      {name}
                    </Link>
                  ))}
                />
              </td>
            </tr>
            {networkDevices.length > 0 ? (
              <tr>
                <th>
                  <h3 className="p-muted-heading p-heading--5">
                    {t("networks")}
                  </h3>
                </th>
                <td>
                  <List
                    className="list"
                    items={networkDevices.map((item) => (
                      <Link
                        key={item.network}
                        to={`/ui/project/${instance.project}/network/${item.network}`}
                      >
                        {item.network}
                      </Link>
                    ))}
                  />
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={2}>
                  <h3 className="p-muted-heading p-heading--5">
                    {t("networks")}
                  </h3>
                  <p>
                    {t("no-networks-found")}
                    <br />
                    <Link
                      to={`/ui/project/${instance.project}/instance/${instance.name}/configuration/networks`}
                    >
                      {t("configure-instance-networks")}
                    </Link>
                  </p>
                </td>
              </tr>
            )}
            <tr className="u-no-border">
              <th colSpan={2} className="snapshots-header">
                <h3 className="p-muted-heading p-heading--5">
                  <Link
                    to={`/ui/project/${instance.project}/instance/${instance.name}/snapshots`}
                  >
                    {t("snapshots")}
                  </Link>
                </h3>
              </th>
            </tr>
            {instance.snapshots?.length ? (
              <>
                {instance.snapshots
                  .slice()
                  .sort((snap1, snap2) => {
                    const a = snap1.created_at;
                    const b = snap2.created_at;
                    return a > b ? -1 : a < b ? 1 : 0;
                  })
                  .slice(0, RECENT_SNAPSHOT_LIMIT)
                  .map((snapshot) => (
                    <tr key={snapshot.name} className="u-no-border">
                      <th
                        title={snapshot.name}
                        className="snapshot-name u-truncate"
                      >
                        <ItemName item={snapshot} />
                      </th>
                      <td className="u-text--muted">
                        <i>{isoTimeToString(snapshot.created_at)}</i>
                      </td>
                    </tr>
                  ))}
                {instance.snapshots.length > RECENT_SNAPSHOT_LIMIT && (
                  <tr>
                    <td colSpan={2}>
                      <Link
                        to={`/ui/project/${instance.project}/instance/${instance.name}/snapshots`}
                      >
                        {t("viewAllInstanceLength", {
                          count: instance.snapshots.length,
                        })}
                      </Link>
                    </td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={2}>
                  <p className="no-snapshots">
                    {t("no-snapshots-found")}
                    <br />
                    <Link
                      to={`/ui/project/${instance.project}/instance/${instance.name}/snapshots`}
                    >
                      {t("manage-instance-snapshots")}
                    </Link>
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </DetailPanel>
  );
};

export default InstanceDetailPanel;
