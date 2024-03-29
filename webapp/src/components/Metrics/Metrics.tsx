import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { ResponsivePlotWrapper } from "components/PlotWrapper";
import React from "react";
import { getMetricsEndpoint, getCustomMetricInfoEndpoint } from "services/api";
import { DatasetSplitName } from "types/api";
import { QueryFilterState, QueryPipelineState } from "types/models";
import { OUTCOME_COLOR, OUTCOME_PRETTY_NAMES } from "utils/const";
import { formatRatioAsPercentageString } from "utils/format";
import Metric from "./Metric";
import MetricsCard from "./MetricsCard";

// This is a special order, different from ALL_OUTCOMES
const OUTCOMES = [
  "CorrectAndRejected",
  "IncorrectAndRejected",
  "CorrectAndPredicted",
  "IncorrectAndPredicted",
] as const;

const OUTCOME_DESCRIPTIONS = {
  CorrectAndPredicted: (
    <>
      <Typography>
        The predicted class matches the label and is not the rejection class.
      </Typography>
    </>
  ),
  CorrectAndRejected: (
    <>
      <Typography>
        The predicted class and the label are the rejection class.
      </Typography>
    </>
  ),
  IncorrectAndRejected: (
    <>
      <Typography>
        The predicted class is the rejection class, but not the label.
      </Typography>
    </>
  ),
  IncorrectAndPredicted: (
    <>
      <Typography>
        The predicted class does not match the label and is not the rejection
        class.
      </Typography>
      <Typography>The target is below 10%.</Typography>
    </>
  ),
};

type Props = {
  jobId: string;
  datasetSplitName: DatasetSplitName;
  filters: QueryFilterState;
  pipeline: Required<QueryPipelineState>;
};

const Metrics: React.FC<Props> = ({
  jobId,
  datasetSplitName,
  filters,
  pipeline,
}) => {
  const theme = useTheme();

  const { data: metrics, isFetching } = getMetricsEndpoint.useQuery({
    jobId,
    datasetSplitName,
    ...filters,
    ...pipeline,
  });

  const { data: metricsInfo } = getCustomMetricInfoEndpoint.useQuery({ jobId });

  const metricsInfoEntries = React.useMemo(() => {
    return metricsInfo && Object.entries(metricsInfo);
  }, [metricsInfo]);

  return (
    <Box display="flex" flexDirection="row" gap={4} overflow="scroll">
      <MetricsCard rowCount={2}>
        {OUTCOMES.map((outcome) => (
          <Metric
            key={outcome}
            isLoading={isFetching}
            value={
              metrics &&
              formatRatioAsPercentageString(
                metrics.outcomeCount[outcome] / metrics.utteranceCount,
                1
              )
            }
            name={OUTCOME_PRETTY_NAMES[outcome]}
            description={
              <>
                {!isFetching && metrics && (
                  <Typography>
                    {`${metrics.outcomeCount[outcome]} out of
            ${metrics.utteranceCount} utterances`}
                  </Typography>
                )}
                {OUTCOME_DESCRIPTIONS[outcome]}
              </>
            }
            color={theme.palette[OUTCOME_COLOR[outcome]].main}
          />
        ))}
      </MetricsCard>
      {metricsInfoEntries && metricsInfoEntries.length > 0 && (
        <MetricsCard>
          {metricsInfoEntries.map(([metricName, { description }]) => (
            <Metric
              key={metricName}
              flexDirection="column"
              isLoading={isFetching}
              value={
                metrics &&
                formatRatioAsPercentageString(
                  metrics.customMetrics[metricName],
                  1
                )
              }
              name={metricName}
              description={<Typography>{description}</Typography>}
            />
          ))}
        </MetricsCard>
      )}
      <MetricsCard
        popover={
          <Box
            width={600}
            height={450}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {isFetching ? (
              <CircularProgress />
            ) : metrics?.ecePlot ? (
              <ResponsivePlotWrapper {...metrics.ecePlot} />
            ) : (
              <Typography>ECE plot unavailable</Typography>
            )}
          </Box>
        }
      >
        <Metric
          flexDirection="column"
          isLoading={isFetching}
          value={metrics?.ece.toFixed(2)}
          name="ECE"
          description={
            <>
              <Typography>
                The ECE measures the calibration of the model, meaning if the
                confidence of the model matches its accuracy.
              </Typography>
              <Typography>
                The lower the better. An ECE of 0 means perfect calibration.
              </Typography>
              <Typography>This ECE is computed using 20 bins.</Typography>
            </>
          }
        />
      </MetricsCard>
    </Box>
  );
};

export default React.memo(Metrics);
