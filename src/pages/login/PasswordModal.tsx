import { FC } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

interface Props {
  onConfirm: (password: string) => void;
  onClose: () => void;
}

const PasswordModal: FC<Props> = ({ onConfirm, onClose }) => {
  const { t } = useTranslation();
  const PasswordSchema = Yup.object().shape({
    password: Yup.string(),
    passwordConfirm: Yup.string().oneOf(
      [Yup.ref("password"), ""],
      t("passwords-must-match"),
    ),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      passwordConfirm: "",
    },
    validationSchema: PasswordSchema,
    onSubmit: (values) => {
      onConfirm(values.password);
    },
  });

  const handleSkip = () => {
    onConfirm("");
  };

  return (
    <Modal
      close={onClose}
      title={t("add-a-password")}
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={handleSkip}>
            {t("skip")}
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => void formik.submitForm()}
            disabled={
              formik.values.password !== formik.values.passwordConfirm ||
              formik.values.password.length === 0
            }
          >
            {t("generate-certificate")}
          </ActionButton>
        </>
      }
    >
      <p>{t("protect-your-certificate-by-adding-a-password")}</p>
      <Input
        id="password"
        type="password"
        label={t("password")}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.password}
        error={formik.touched.password ? formik.errors.password : null}
        help={t(
          "for-macos-an-empty-password-is-not-allowed-on-other-systems-this-step-can-be-skipped",
        )}
      />
      <Input
        id="passwordConfirm"
        type="password"
        label={t("password-confirmation")}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.passwordConfirm}
        error={
          formik.touched.passwordConfirm ? formik.errors.passwordConfirm : null
        }
      />
    </Modal>
  );
};

export default PasswordModal;
