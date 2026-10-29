import sys
from pathlib import Path
import unittest
import numpy as np
import pandas as pd
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src'))
from data_pipeline import load_dataset, feature_frame, extend_future_calendar
from prepare_data import build_dataset
from forecasting import (rolling_predictions, pretest_calibration_predictions,
                         add_rolling_intervals, forecast_next, forecast_scenario)
from evaluation import score_predictions, interval_scores
from decision_engine import recommended_buffers, policy_backtest, SHORTFALL_COST

class FlowGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.df = load_dataset()
        cls.pred = rolling_predictions(cls.df)
        cls.pretest = pretest_calibration_predictions(cls.df)
        cls.intervals = add_rolling_intervals(cls.pred, pretest_predictions=cls.pretest)
        cls.interval_metrics = interval_scores(cls.intervals)
        cls.metrics = score_predictions(cls.pred)
        cls.fc = forecast_next(cls.df, cls.metrics, cls.pred)

    def test_raw_files_rebuild_the_supplied_processed_panel(self):
        rebuilt = build_dataset()
        supplied = pd.read_csv(ROOT / "data" / "processed" / "monthly_dataset.csv")
        pd.testing.assert_frame_equal(rebuilt, supplied, check_dtype=False, check_exact=False, rtol=1e-12, atol=1e-8)

    def test_input_dimensions_and_arithmetic(self):
        self.assertEqual(self.df.shape, (69, 24))
        self.assertTrue(np.allclose(self.df.net_flow_liquid, self.df.mobilized_liquid - self.df.redemptions_liquid, atol=1e-5))
        self.assertTrue(np.allclose(self.df.net_flow_overnight, self.df.mobilized_overnight - self.df.redemptions_overnight, atol=1e-5))

    def test_initial_rolling_volatility_is_not_filled(self):
        self.assertEqual(self.df.nifty_volatility_3m.isna().sum(), 2)

    def test_features_are_lagged_and_calendar_is_target_month(self):
        x = feature_frame(self.df, horizon=1)
        self.assertEqual(x.loc[20, 'net_flow_liquid_lag1'], self.df.loc[19, 'net_flow_liquid'])
        self.assertEqual(x.loc[20, 'repo_rate_lag1'], self.df.loc[19, 'repo_rate'])
        cal = 'calendar_quarter_end'
        self.assertEqual(x.loc[20, cal], self.df.loc[21, cal])

    def test_future_calendar_is_added_from_schedule(self):
        future = extend_future_calendar(self.df, 3)
        self.assertEqual(future.month.iloc[-3:].tolist(), ['2026-10', '2026-11', '2026-12'])
        self.assertEqual(float(future.calendar_quarter_end.iloc[-1]), 1.0)

    def test_backtest_uses_last_24_target_releases_for_every_horizon(self):
        pred = self.pred
        counts = pred.groupby(['target', 'model', 'horizon']).size()
        self.assertTrue((counts == 24).all())

    def test_recursive_forecast_and_buffer_are_finite(self):
        pred = self.pred
        fc = self.fc
        buffers = recommended_buffers(fc)
        self.assertEqual(len(fc), 6)
        self.assertTrue(np.isfinite(fc.point_forecast).all())
        self.assertTrue(np.isfinite(buffers.p95_potential_outflow_buffer).all())

    def test_competition_cost_uses_three_x_shortfall(self):
        self.assertEqual(SHORTFALL_COST, 3.0)

    def test_march_scenario_is_separate_and_six_month_horizon(self):
        scenario = forecast_scenario(self.df, self.metrics, self.pred, 6)
        self.assertEqual(scenario.forecast_month.tolist(), ['2027-03', '2027-03'])
        self.assertEqual(set(scenario.horizon), {6})
        self.assertTrue(scenario.frequency_note.str.contains('not a daily').all())

    def test_decision_backtest_has_two_policies(self):
        pred = self.pred
        rows = policy_backtest(pred, self.metrics, df=self.df, pretest_predictions=self.pretest)
        self.assertTrue({'forecast_p95_buffer', 'last_year_same_month_outflow'}.issubset(set(rows.policy)))
        self.assertTrue((rows.decision_cost >= 0).all())
        base = rows[rows.policy == 'last_year_same_month_outflow'].iloc[0]
        naive = self.pred[(self.pred.target == base.target) & (self.pred.horizon == base.horizon) & (self.pred.model == 'seasonal_naive') & (self.pred.month == base.month)].prediction.iloc[0]
        self.assertAlmostEqual(base.buffer, max(0.0, -naive))
        self.assertTrue((rows.groupby(['target', 'horizon', 'policy']).size() == 24).all())

    def test_selected_model_interval_coverage_has_24_releases(self):
        best = self.metrics.sort_values('MAE').groupby(['target', 'horizon'], as_index=False).first()
        selected = self.interval_metrics.merge(best[['target', 'horizon', 'model']], on=['target', 'horizon', 'model'])
        self.assertTrue((selected.n_test == 24).all())


if __name__ == '__main__':
    unittest.main()
