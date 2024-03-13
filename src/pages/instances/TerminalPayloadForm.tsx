import { FC, KeyboardEvent, useEffect, useRef } from "react";
import {
  ActionButton,
  Button,
  Form,
  Icon,
  Input,
  Modal,
} from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { TerminalConnectPayload } from "types/terminal";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";

interface Props {
  payload: TerminalConnectPayload;
  close: () => void;
  reconnect: (val: TerminalConnectPayload) => void;
}

const TerminalPayloadForm: FC<Props> = ({ payload, close, reconnect }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const TerminalSchema = Yup.object().shape({
    command: Yup.string().required(t("this-field-is-required")),
    environment: Yup.array().of(
      Yup.object().shape({
        key: Yup.string(),
        value: Yup.string(),
      }),
    ),
    user: Yup.number(),
    group: Yup.number(),
  });

  const formik = useFormik<TerminalConnectPayload>({
    initialValues: payload,
    validationSchema: TerminalSchema,
    onSubmit: reconnect,
  });

  const addEnvironmentRow = () => {
    const copy = [...formik.values.environment];
    copy.push({ key: "", value: "" });
    void formik.setFieldValue("environment", copy);
  };

  const removeEnvironmentRow = (index: number) => {
    const copy = [...formik.values.environment];
    copy.splice(index, 1);
    void formik.setFieldValue("environment", copy);
  };

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === t("escape")) {
      close();
    }
  };

  const updateContentHeight = () => {
    updateMaxHeight("content-wrapper", "p-modal__footer", 64, "max-height");
  };
  useEventListener("resize", updateContentHeight);
  useEffect(updateContentHeight, []);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "start",
    });
    window.dispatchEvent(new Event("resize"));
  }, [formik.values.environment]);

  return (
    <Modal
      close={close}
      title={t("reconnect-terminal")}
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            aria-label={t("cancel-reconnect")}
            onClick={close}
          >
            {t("cancel")}
          </Button>
          <ActionButton
            className="u-no-margin--bottom"
            appearance="positive"
            aria-label={t("submit-reconnect")}
            onClick={() => void formik.submitForm()}
          >
            {t("reconnect")}
          </ActionButton>
        </>
      }
      onKeyDown={handleEscKey}
    >
      <Form onSubmit={formik.handleSubmit}>
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value={t("hidden-input")} />
        <div className="content-wrapper">
          <Input
            id="command"
            name="command"
            label={t("command")}
            labelClassName="u-no-margin--bottom"
            type="text"
            required
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.command ? formik.errors.command : null}
            value={formik.values.command}
          />
          <Input
            id="user"
            name="user"
            label={t("user-id")}
            labelClassName="u-no-margin--bottom"
            type="number"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.user}
          />
          <Input
            id="group"
            name="group"
            label={t("group-id")}
            labelClassName="u-no-margin--bottom"
            type="number"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.group}
          />
          <p className="u-no-margin--bottom p-form__label">
            {t("environment-variables")}
          </p>
          {formik.values.environment.map((_variable, index) => (
            <div key={index} className="env-variables">
              <Input
                type="text"
                placeholder={t("key")}
                labelClassName="u-off-screen"
                label={t("keyOfVariable", { index: index })}
                id={`environment.${index}.key`}
                name={`environment.${index}.key`}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.environment[index].key}
              />
              <Input
                type="text"
                placeholder={t("value")}
                labelClassName="u-off-screen"
                label={t("valueOfVariable", { index: index })}
                id={`environment.${index}.value`}
                name={`environment.${index}.value`}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.environment[index].value}
              />
              <Button
                aria-label={t("removeVariable", { index: index })}
                onClick={() => removeEnvironmentRow(index)}
                type="button"
                hasIcon
              >
                <Icon name="delete" />
              </Button>
            </div>
          ))}
          <div ref={ref}>
            <Button
              aria-label={t("add-variable")}
              onClick={addEnvironmentRow}
              type="button"
            >
              <span>{t("add-variable-0")}</span>
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default TerminalPayloadForm;
