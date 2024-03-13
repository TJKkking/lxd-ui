import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import { LxdInstance } from "types/instance";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { renameInstance } from "api/instances";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import {
  instanceLinkFromName,
  instanceLinkFromOperation,
} from "util/instances";
import { getInstanceName } from "util/operations";
import InstanceLink from "pages/instances/InstanceLink";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  instance?: LxdInstance;
  project: string;
}

const InstanceDetailHeader: FC<Props> = ({ name, instance, project }) => {
  const eventQueue = useEventQueue();
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { t } = useTranslation();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        t("an-instance-with-this-name-already-exists"),
        (value) =>
          instance?.name === value ||
          checkDuplicateName(value, project, controllerState, "instances"),
      )
      .matches(/^[A-Za-z0-9-]+$/, {
        message: t("only-alphanumeric-and-hyphen-characters-are-allowed"),
      })
      .matches(/^[A-Za-z].*$/, {
        message: t("instance-name-must-start-with-a-letter"),
      })
      .required(t("instance-name-is-required")),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      void renameInstance(name, values.name, project)
        .then((operation) => {
          const instanceLink = instanceLinkFromName({
            instanceName: values.name,
            project,
          });
          eventQueue.set(
            operation.metadata.id,
            () => {
              navigate(`/ui/project/${project}/instance/${values.name}`);
              toastNotify.success(
                <>
                  t('instance'){" "}
                  <strong>{getInstanceName(operation.metadata)}</strong>{" "}
                  {t("renamed-to")} {instanceLink}.
                </>,
              );
              void formik.setFieldValue("isRenaming", false);
            },
            (msg) =>
              toastNotify.failure(
                t("renaming-instance-failed"),
                new Error(msg),
                instanceLinkFromOperation({ operation, project }),
              ),
            () => formik.setSubmitting(false),
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          toastNotify.failure(
            `Renaming instance failed.`,
            e,
            instance ? <InstanceLink instance={instance} /> : undefined,
          );
        });
    },
  });

  return (
    <RenameHeader
      name={name}
      titleClassName="instance-detail-title"
      parentItems={[
        <Link to={`/ui/project/${project}/instances`} key={1}>
          t('instances')
        </Link>,
      ]}
      renameDisabledReason={
        instance?.status !== t("stopped")
          ? t("stop-the-instance-to-rename")
          : undefined
      }
      centerControls={
        instance ? (
          <div>
            <i className="status u-text--muted">{instance.status}</i>
            <InstanceStateActions key="state" instance={instance} />
          </div>
        ) : null
      }
      controls={
        instance ? <DeleteInstanceBtn key="delete" instance={instance} /> : null
      }
      isLoaded={Boolean(instance)}
      formik={formik}
    />
  );
};

export default InstanceDetailHeader;
