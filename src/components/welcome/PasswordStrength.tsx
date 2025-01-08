import { type DiversityType, passwordStrength } from "check-password-strength";
import { Spacer, Text } from "@arconnect/components-rebrand";
import { useMemo } from "react";
import browser from "webextension-polyfill";
import styled from "styled-components";
import { Check, X } from "@untitled-ui/icons-react";

export default function PasswordStrength({ password }: Props) {
  // get strength
  const strength = useMemo(() => passwordStrength(password || ""), [password]);

  // strength index
  const strengthIndex = useMemo(
    () => (strength.id === 0 ? 1 : strength.id + 2),
    [strength]
  );

  // checklist elements
  const checklist: ChecklistElement[] = [
    {
      validity: ["lowercase", "uppercase"],
      display: "password_strength_checklist_case"
    },
    {
      validity: ["number"],
      display: "password_strength_checklist_number"
    },
    {
      validity: ["symbol"],
      display: "password_strength_checklist_symbol"
    }
  ];

  return (
    <>
      <ProgressBar>
        {new Array(5).fill("").map((_, i) => (
          <Bar active={strengthIndex >= i + 1} key={i} />
        ))}
      </ProgressBar>
      <Spacer y={0.35} />
      <Text noMargin>
        {browser.i18n.getMessage(`password_strength_${strengthIndex}`)}
      </Text>
      <Spacer y={1.5} />
      <StrengthChecklist>
        {checklist.map((elem, i) => {
          let valid = true;

          for (const diversity of elem.validity) {
            if (strength.contains.includes(diversity)) continue;
            valid = false;
          }

          return (
            <StrengthCheck isValid={valid} key={i}>
              {(valid && <Check />) || <X height={24} />}
              <Text variant="secondary" noMargin>
                {browser.i18n.getMessage(elem.display)}
              </Text>
            </StrengthCheck>
          );
        })}
        <StrengthCheck isValid={password && password.length >= 5}>
          {(password && password.length >= 5 && <Check height={24} />) || (
            <X height={24} />
          )}
          <Text variant="secondary" noMargin>
            {browser.i18n.getMessage("password_strength_checklist_length", "5")}
          </Text>
        </StrengthCheck>
      </StrengthChecklist>
    </>
  );
}

interface Props {
  password: string;
}

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Bar = styled.div<{ active: boolean }>`
  width: 18%;
  height: 4px;
  background-color: ${(props) =>
    props.active ? props.theme.theme : "rgba(107, 87, 249, 0.50)"};
  transition: all 0.23s ease-in-out;
`;

const StrengthChecklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const StrengthCheck = styled.div<{ isValid?: boolean; length?: number }>`
  display: flex;
  align-items: center;
  gap: 0.45rem;

  svg {
    font-size: 1rem;
    width: 1.5em;
    height: 1.5em;
    color: ${(props) => (props.isValid ? "#56C980" : "#F1655B")};
    transition: all 0.17s ease-in-out;
  }
`;

interface ChecklistElement {
  validity: DiversityType[];
  display: string;
}
