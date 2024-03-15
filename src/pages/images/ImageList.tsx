import { FC, useEffect, useState } from "react";
import {
  EmptyState,
  Icon,
  List,
  Row,
  SearchBox,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { queryKeys } from "util/queryKeys";
import { fetchImageList } from "api/images";
import DeleteImageBtn from "./actions/DeleteImageBtn";
import { useQuery } from "@tanstack/react-query";
import Loader from "components/Loader";
import { useParams } from "react-router-dom";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import { localLxdToRemoteImage } from "util/images";
import ScrollableTable from "components/ScrollableTable";
import useSortTableData from "util/useSortTableData";
import SelectableMainTable from "components/SelectableMainTable";
import BulkDeleteImageBtn from "pages/images/actions/BulkDeleteImageBtn";
import SelectedTableNotification from "components/SelectedTableNotification";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import { useDocs } from "context/useDocs";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import { useTranslation } from "react-i18next";

const ImageList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const { t } = useTranslation();

  if (!project) {
    return <>{t("missing-project")}</>;
  }

  const {
    data: images = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.images, project],
    queryFn: () => fetchImageList(project),
  });

  if (error) {
    notify.failure(t("loading-images-failed"), error);
  }

  useEffect(() => {
    const validNames = new Set(images?.map((image) => image.fingerprint));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [images]);

  const headers = [
    { content: t("name"), sortKey: "name" },
    { content: t("alias"), sortKey: "alias" },
    {
      content: t("architecture"),
      sortKey: "architecture",
      className: "architecture",
    },
    {
      content: t("public"),
      sortKey: "public",
      className: "public",
    },
    { content: t("type"), sortKey: "type", className: "type" },
    {
      content: t("upload-date"),
      sortKey: "uploaded_at",
      className: "uploaded_at",
    },
    { content: t("size"), sortKey: "size", className: "u-align--right size" },
    { "aria-label": t("actions"), className: "actions" },
  ];

  const filteredImages = images.filter(
    (item) =>
      !query ||
      item.properties.description.toLowerCase().includes(query.toLowerCase()) ||
      item.aliases
        .map((alias) => alias.name)
        .join(", ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const rows = filteredImages.map((image) => {
    const actions = (
      <List
        inline
        className="actions-list u-no-margin--bottom"
        items={[
          <CreateInstanceFromImageBtn
            key="launch"
            project={project}
            image={localLxdToRemoteImage(image)}
          />,
          <DeleteImageBtn key="delete" image={image} project={project} />,
        ]}
      />
    );

    const imageAlias = image.aliases.map((alias) => alias.name).join(", ");

    return {
      name: image.fingerprint,
      columns: [
        {
          content: image.properties.description,
          role: "cell",
          "aria-label": t("name"),
        },
        {
          content: imageAlias,
          role: "cell",
          "aria-label": t("aliases"),
          className: "aliases",
        },
        {
          content: image.architecture,
          role: "cell",
          "aria-label": t("architecture"),
          className: "architecture",
        },
        {
          content: image.public ? t("yes") : t("no"),
          role: "cell",
          "aria-label": t("public"),
          className: "public",
        },
        {
          content: image.type == "virtual-machine" ? "VM" : t("container"),
          role: "cell",
          "aria-label": t("type"),
          className: "type",
        },
        {
          content: isoTimeToString(image.uploaded_at),
          role: "cell",
          "aria-label": t("upload-date"),
          className: "uploaded_at",
        },
        {
          content: humanFileSize(image.size),
          role: "cell",
          "aria-label": t("size"),
          className: "u-align--right size",
        },
        {
          content: actions,
          role: "cell",
          "aria-label": t("actions"),
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: image.properties.description.toLowerCase(),
        alias: imageAlias.toLowerCase(),
        architecture: image.architecture,
        public: image.public,
        type: image.type,
        size: +image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Loader text={t("loading-images")} />;
  }

  return (
    <CustomLayout
      contentClassName="u-no-padding--bottom"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/image-handling/`}
                title={t("learn-more-about-images")}
              >
                {t("images")}
              </HelpLink>
            </PageHeader.Title>
            {selectedNames.length === 0 && images.length > 0 && (
              <PageHeader.Search>
                <SearchBox
                  name="search-images"
                  className="search-box u-no-margin--bottom"
                  type="text"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder={t("search")}
                  value={query}
                  aria-label={t("search-for-images")}
                />
              </PageHeader.Search>
            )}
            {selectedNames.length > 0 && (
              <BulkDeleteImageBtn
                fingerprints={selectedNames}
                project={project}
                onStart={() => setProcessingNames(selectedNames)}
                onFinish={() => setProcessingNames([])}
              />
            )}
          </PageHeader.Left>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {images.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<Icon name="mount" className="empty-state-icon" />}
            title={t("no-images-found-in-this-project")}
          >
            <p>
              {t(
                "images-will-appear-here-when-launching-an-instance-from-a-remote",
              )}
            </p>
          </EmptyState>
        )}
        {images.length > 0 && (
          <ScrollableTable
            dependencies={[images]}
            tableId="image-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="image"
              className="u-no-margin--top"
              aria-label={t("table-pagination-control")}
              description={
                selectedNames.length > 0 && (
                  <SelectedTableNotification
                    totalCount={images.length ?? 0}
                    itemName="image"
                    parentName="project"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    filteredNames={filteredImages.map(
                      (item) => item.fingerprint,
                    )}
                  />
                )
              }
            >
              <SelectableMainTable
                id="image-table"
                headers={headers}
                sortable
                className="image-table"
                emptyStateMsg={t("no-images-found-matching-this-search")}
                onUpdateSort={updateSort}
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                itemName="image"
                parentName="project"
                filteredNames={filteredImages.map((item) => item.fingerprint)}
                processingNames={processingNames}
                rows={[]}
              />
            </TablePagination>
          </ScrollableTable>
        )}
      </Row>
    </CustomLayout>
  );
};

export default ImageList;
