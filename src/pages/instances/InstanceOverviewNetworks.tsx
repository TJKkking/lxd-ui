import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable } from "@canonical/react-components";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { Link } from "react-router-dom";
import { fetchNetworks } from "api/networks";
import { isNicDevice } from "util/devices";
import { useTranslation } from "react-i18next";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewNetworks: FC<Props> = ({ instance, onFailure }) => {
  const {
    data: networks = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.projects, instance.project, queryKeys.networks],
    queryFn: () => fetchNetworks(instance.project),
  });

  const { t } = useTranslation();

  if (error) {
    onFailure(t("loading-networks-failed"), error);
  }

  const instanceNetworks = Object.values(instance.expanded_devices ?? {})
    .filter(isNicDevice)
    .map((network) => network.network);

  const hasNetworks = instanceNetworks.length > 0;

  const networksHeaders = [
    { content: t("name"), sortKey: "name", className: "p-muted-heading" },
    {
      content: t("interface"),
      sortKey: "interfaceName",
      className: "p-muted-heading",
    },
    { content: t("type"), sortKey: "type", className: "p-muted-heading" },
    {
      content: t("managed"),
      sortKey: "managed",
      className: "p-muted-heading u-hide--small u-hide--medium",
    },
  ];

  const networksRows = networks
    .filter((network) => instanceNetworks.includes(network.name))
    .map((network) => {
      const interfaceNames = Object.entries(instance.expanded_devices ?? {})
        .filter(
          ([_key, value]) =>
            value.type === "nic" && value.network === network.name,
        )
        .map(([key]) => key);

      return {
        columns: [
          {
            content: (
              <Link
                to={`/ui/project/${instance.project}/network/${network.name}`}
                title={t("networkName", { name: network.name })}
              >
                {network.name}
              </Link>
            ),
            role: "rowheader",
            "aria-label": t("name"),
          },
          {
            content: interfaceNames.length > 0 ? interfaceNames.join(" ") : "-",
            role: "rowheader",
            "aria-label": t("interface"),
          },
          {
            content: network.type,
            role: "rowheader",
            "aria-label": t("type"),
          },
          {
            content: network.managed ? t("yes") : t("no"),
            role: "rowheader",
            "aria-label": t("managed"),
          },
        ],
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type,
          managed: network.managed,
          interfaceName: interfaceNames.join(" "),
        },
      };
    });

  return (
    <>
      {isLoading && <Loader text={t("loading-networks")} />}
      {!isLoading && hasNetworks && (
        <MainTable headers={networksHeaders} rows={networksRows} sortable />
      )}
      {!isLoading && !hasNetworks && <>-</>}
    </>
  );
};

export default InstanceOverviewNetworks;
