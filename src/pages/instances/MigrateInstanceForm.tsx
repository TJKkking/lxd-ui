import { FC, KeyboardEvent } from "react";
import {
  ActionButton,
  Button,
  Form,
  Modal,
  Select,
} from "@canonical/react-components";
import * as Yup from "yup";
import { useFormik } from "formik";
import { LxdClusterMember } from "types/cluster";
import { useTranslation } from "react-i18next";

interface Props {
  close: () => void;
  migrate: (target: string) => void;
  instance: string;
  location: string;
  members: LxdClusterMember[];
}

const MigrateInstanceForm: FC<Props> = ({
  close,
  migrate,
  instance,
  location,
  members,
}) => {
  const memberNames = members.map((member) => member.server_name);

  const { t } = useTranslation();

  const MigrateSchema = Yup.object().shape({
    target: Yup.string().min(1, t("this-field-is-required")),
  });

  const formik = useFormik({
    initialValues: {
      target: memberNames.find((member) => member !== location) ?? "",
    },
    validationSchema: MigrateSchema,
    onSubmit: (values) => {
      migrate(values.target);
    },
  });

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === t("escape")) {
      close();
    }
  };

  return (
    <Modal
      close={close}
      className="migrate-instance-modal"
      title={t("migrateInstance", { instance: instance })}
      buttonRow={
        <>
          <Button
            className="u-no-margin--bottom"
            type="button"
            aria-label={t("cancel-migrate")}
            appearance="base"
            onClick={close}
          >
            {t("cancel")}
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => void formik.submitForm()}
            disabled={!formik.isValid}
          >
            {t("migrate")}
          </ActionButton>
        </>
      }
      onKeyDown={handleEscKey}
    >
      <Form onSubmit={formik.handleSubmit}>
        <Select
          id="locationMember"
          label={t("move-instance-to-cluster-member")}
          onChange={(e) => void formik.setFieldValue("target", e.target.value)}
          value={formik.values.target}
          options={memberNames.map((member) => {
            return {
              label: member,
              value: member,
              disabled: member === location,
            };
          })}
        />
      </Form>
    </Modal>
  );
};

export default MigrateInstanceForm;
