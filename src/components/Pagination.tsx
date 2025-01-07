import { Text } from "@arconnect/components-rebrand";
import styled from "styled-components";
import browser from "webextension-polyfill";
import { motion } from "framer-motion";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  subtitle: string;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  subtitle
}) => {
  // Calculate width percentage properly
  const widthPercentage = Math.max((currentPage / totalPages) * 100, 0);

  return (
    <PaginationContainer>
      <InactivePagination>
        <ActivePagination
          style={{ width: `${widthPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${widthPercentage}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </InactivePagination>
      <Text size="sm" weight="medium" noMargin>
        {browser.i18n.getMessage("step")} {currentPage}:{" "}
        {browser.i18n.getMessage(subtitle)}
      </Text>
    </PaginationContainer>
  );
};

export const CheckIcon = () => (
  <svg
    width="11"
    height="8"
    viewBox="0 0 11 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.67794 6.31171L1.30728 3.82401L0.5 4.66517L3.67794 8L10.5 0.841163L9.69841 0L3.67794 6.31171Z"
      fill="white"
    />
  </svg>
);

const PaginationContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InactivePagination = styled.div`
  display: flex;
  height: 4px;
  width: 100%;
  align-items: center;
  align-self: stretch;
  border-radius: 50px;
  background: rgba(107, 87, 249, 0.5);
`;

const ActivePagination = styled(motion.div)`
  height: 100%;
  border-radius: 50px;
  background: #6b57f9;
  min-width: 0;
`;

export default Pagination;
