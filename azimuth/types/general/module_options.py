# Copyright ServiceNow, Inc. 2021 – 2022
# This source code is licensed under the Apache 2.0 license found in the LICENSE file
# in the root directory of this source tree.

from enum import Enum
from typing import List, Optional

from pydantic import Field

from azimuth.types import AliasModel, SupportedMethod
from azimuth.types.outcomes import OutcomeName
from azimuth.types.tag import DataAction, SmartTag


class AbsDatasetFilters(AliasModel):
    confidence_min: float = 0
    confidence_max: float = 1
    data_actions: List[DataAction] = []
    outcomes: List[OutcomeName] = []
    smart_tags: List[SmartTag] = []
    utterance: Optional[str]  # Must contain this subset.


class DatasetFilters(AbsDatasetFilters):
    labels: List[int] = []
    predictions: List[int] = []


class NamedDatasetFilters(AbsDatasetFilters):
    labels: List[str] = []
    predictions: List[str] = []

    def to_dataset_filters(self, class_names: List[str]) -> DatasetFilters:
        return DatasetFilters(
            confidence_min=self.confidence_min,
            confidence_max=self.confidence_max,
            labels=[class_names.index(cl) for cl in self.labels],
            predictions=[class_names.index(cl) for cl in self.predictions],
            data_actions=self.data_actions,
            outcomes=self.outcomes,
            smart_tags=self.smart_tags,
            utterance=self.utterance,
        )


class GradientCalculation(str, Enum):
    """Denote the different ways to handle the gradient calculation."""

    xMIN = "xMIN"  # gradient x input, then choose dimension with lowest value
    # gradient x input, then choose dimension with highest absolute value
    xABS_MAX = "xABS_MAX"
    xSUM = "xSUM"  # gradient x input, then sum across all dimensions
    xL2 = "xL2"  # gradient x input, then compute L2 norm
    L2 = "L2"  # vanilla gradient, then compute L2 norm


class ModuleOptions(AliasModel):
    model_contract_method_name: Optional[SupportedMethod] = Field(
        None, title="Method to call on a ModelContractModule"
    )
    filters: DatasetFilters = Field(DatasetFilters(), title="Filter the dataset")
    indices: Optional[List[int]] = Field(None, title="Indices on which to run the module.")
    pipeline_index: Optional[int] = Field(
        None, title="Pipeline Index", description="What is the pipeline we are requesting."
    )
    gradient_calculation: GradientCalculation = Field(
        GradientCalculation.L2, title="Gradient calculation"
    )
    threshold: Optional[float] = Field(None, title="Threshold")
    iterations: int = Field(1, title="MC Iterations")
    filter_class: Optional[int] = Field(
        None, title="Get saliency for another class then the " "prediction."
    )
    top_x: int = Field(10, title="Number of word to count in top saliency")
    th_importance: float = Field(
        0.6,
        title="Threshold for a token to be considered important in "
        "its utterance relative to the max saliency value.",
    )
    perc_salient_eval: float = Field(
        0.03,
        title="Threshold for a salient word to be considered important for a given class.",
    )
    max_perc_train: float = Field(
        0.1,
        title="Threshold for a salient word to be considered overlapping in the training set for "
        "a given class.",
    )
    use_bma: bool = Field(False, title="Use Bayesian Model Averaging for better estimation.")
    force_no_saliency: bool = Field(
        False,
        title="Force Top Words to use frequency instead of "
        "saliency to determine important words.",
    )
    nb_bins: int = Field(
        20,
        title="Nb of bins to compute for different modules.",
    )
