# FlowGuard model results and methodology

Dataset: 69 monthly observations, 2021-01 to 2026-09. Targets use positive=inflow, negative=outflow.

## Forecast engine

Models are seasonal naive, additive ETS, and a regularized HistGradientBoosting regressor. Backtests use expanding origins over the same last 24 target months at horizons 1, 2, 3 and 6; the six-month horizon supports the separate March scenario. Forecast features are causal: prior-month flows/rates/liquidity/equity and scheduled target-month calendar events. Model selection is per target/horizon by lowest rolling-origin MAE.

### Model comparison

| target | model | horizon | n_test | MAE | RMSE | MAPE_nonzero_actual_pct |
| --- | --- | --- | --- | --- | --- | --- |
| net_flow_liquid | seasonal_naive | 1 | 24 | 33198.8669306905 | 40501.13557861489 | 137.13956874196313 |
| net_flow_liquid | HistGradientBoosting | 1 | 24 | 40986.42897365096 | 50105.27637429541 | 144.71757526822603 |
| net_flow_liquid | ETS | 1 | 24 | 41327.788000548906 | 48635.32658832974 | 218.31132211711636 |
| net_flow_liquid | seasonal_naive | 2 | 24 | 33198.8669306905 | 40501.13557861489 | 137.13956874196313 |
| net_flow_liquid | HistGradientBoosting | 2 | 24 | 40719.07034912389 | 50673.86110153353 | 114.10207944774295 |
| net_flow_liquid | ETS | 2 | 24 | 42122.24112060274 | 49748.74985980378 | 185.43467006927042 |
| net_flow_liquid | seasonal_naive | 3 | 24 | 33198.8669306905 | 40501.13557861489 | 137.13956874196313 |
| net_flow_liquid | HistGradientBoosting | 3 | 24 | 39050.918811419084 | 48163.447930146765 | 159.7831466608269 |
| net_flow_liquid | ETS | 3 | 24 | 40397.12738821199 | 48525.21855007256 | 187.03050203852973 |
| net_flow_liquid | seasonal_naive | 6 | 24 | 33198.8669306905 | 40501.13557861489 | 137.13956874196313 |
| net_flow_liquid | HistGradientBoosting | 6 | 24 | 39594.876721478104 | 48507.47506741509 | 195.29407743235342 |
| net_flow_liquid | ETS | 6 | 24 | 42599.002322175984 | 51507.57582917022 | 191.39102751898358 |
| net_flow_overnight | HistGradientBoosting | 1 | 24 | 15202.440546586993 | 20446.33997759114 | 79.4082774807746 |
| net_flow_overnight | seasonal_naive | 1 | 24 | 15804.116845321654 | 19157.3461181566 | 497.46578807717424 |
| net_flow_overnight | ETS | 1 | 24 | 17141.489507591294 | 19908.215372631763 | 184.34414546640969 |
| net_flow_overnight | seasonal_naive | 2 | 24 | 15804.116845321654 | 19157.3461181566 | 497.46578807717424 |
| net_flow_overnight | ETS | 2 | 24 | 16669.7130168822 | 19576.77502901629 | 161.13655972290968 |
| net_flow_overnight | HistGradientBoosting | 2 | 24 | 16705.481364438983 | 20865.867520433258 | 116.04988723503833 |
| net_flow_overnight | HistGradientBoosting | 3 | 24 | 15475.346522383685 | 19674.78944354394 | 121.13497909636288 |
| net_flow_overnight | seasonal_naive | 3 | 24 | 15804.116845321654 | 19157.3461181566 | 497.46578807717424 |
| net_flow_overnight | ETS | 3 | 24 | 16589.606990814107 | 19582.68138266865 | 184.66471870478756 |
| net_flow_overnight | seasonal_naive | 6 | 24 | 15804.116845321654 | 19157.3461181566 | 497.46578807717424 |
| net_flow_overnight | HistGradientBoosting | 6 | 24 | 16953.002200257415 | 19725.621632749007 | 305.87108945322245 |
| net_flow_overnight | ETS | 6 | 24 | 17171.975629419572 | 20305.83566402114 | 195.25705398680483 |

The lag-only tree is retained as an ML challenger; a small dataset and strong seasonal pattern can favor simple baselines. Rolling-origin results choose the final model rather than assuming ML wins. MAPE is supplementary and excludes near-zero actuals.

## Prediction intervals

80% and 95% intervals are empirical residual intervals calibrated from earlier out-of-fold errors for each model, target and horizon. Coverage uses earlier pre-test and test-period out-of-fold calibration errors, with at least eight prior errors required. `outputs/interval_metrics.csv` reports empirical coverage, interval width and pinball loss for lower and upper interval edges.

## Driver analysis

Each driver group is added to the same autoregressive ML baseline and tested out of sample on rolling origins at 1- and 3-month horizons. Negative MAE reduction means that group worsened out-of-sample accuracy. This measures predictive value in this small sample, not causation.

| target | horizon | driver_set | n_test | MAE | RMSE | baseline_MAE | MAE_reduction_vs_base_pct |
| --- | --- | --- | --- | --- | --- | --- | --- |
| net_flow_liquid | 1 | autoregressive_only | 24 | 42540.3799845479 | 51285.978964962764 | 42540.3799845479 | 0.0 |
| net_flow_liquid | 1 | calendar | 24 | 39814.03237484184 | 47845.60431444601 | 42540.3799845479 | 6.4088463965210565 |
| net_flow_liquid | 1 | equity | 24 | 42485.716610452546 | 51229.27450027154 | 42540.3799845479 | 0.12849761594797787 |
| net_flow_liquid | 1 | liquidity | 24 | 45737.28725056003 | 53677.143985018105 | 42540.3799845479 | -7.514994617286812 |
| net_flow_liquid | 1 | rates | 24 | 44615.17334368724 | 53333.25704554373 | 42540.3799845479 | -4.877232784222831 |
| net_flow_liquid | 3 | autoregressive_only | 24 | 36992.33990899221 | 46150.21532382498 | 36992.33990899221 | 0.0 |
| net_flow_liquid | 3 | calendar | 24 | 37039.45479703991 | 45903.387321950446 | 36992.33990899221 | -0.12736390334758135 |
| net_flow_liquid | 3 | equity | 24 | 36797.416459346634 | 45278.97597579814 | 36992.33990899221 | 0.526929224064015 |
| net_flow_liquid | 3 | liquidity | 24 | 37543.46013951473 | 46368.99836451081 | 36992.33990899221 | -1.4898225737500734 |
| net_flow_liquid | 3 | rates | 24 | 36608.62467859392 | 46166.1170156013 | 36992.33990899221 | 1.0372829384199427 |
| net_flow_overnight | 1 | autoregressive_only | 24 | 15808.034563880434 | 20445.0893404076 | 15808.034563880434 | 0.0 |
| net_flow_overnight | 1 | calendar | 24 | 15750.747760599892 | 20382.47460956237 | 15808.034563880434 | 0.3623904227248822 |
| net_flow_overnight | 1 | equity | 24 | 15025.36477247419 | 19719.748420622072 | 15808.034563880434 | 4.951088563498944 |
| net_flow_overnight | 1 | liquidity | 24 | 16469.58810363056 | 21252.593191107102 | 15808.034563880434 | -4.184919618417984 |
| net_flow_overnight | 1 | rates | 24 | 16031.834336254842 | 20735.077948974133 | 15808.034563880434 | -1.4157343309823314 |
| net_flow_overnight | 3 | autoregressive_only | 24 | 14618.789614633133 | 18008.99997105556 | 14618.789614633133 | 0.0 |
| net_flow_overnight | 3 | calendar | 24 | 14618.789614633133 | 18008.99997105556 | 14618.789614633133 | 0.0 |
| net_flow_overnight | 3 | equity | 24 | 14725.812095365793 | 18429.501860033997 | 14618.789614633133 | -0.7320885213747927 |
| net_flow_overnight | 3 | liquidity | 24 | 15358.562710095604 | 18947.58713292833 | 14618.789614633133 | -5.060426444074223 |
| net_flow_overnight | 3 | rates | 24 | 14711.29887619878 | 18128.307800870025 | 14618.789614633133 | -0.6328106772468133 |

## Cash buffer and decision costs

Recommended buffer is max(0, -lower05(net-flow forecast)), the 95th-percentile potential outflow. Central 80% and 95% two-sided intervals are reported separately. Backtest policy compares this forecast uncertainty buffer with the prior-year same-month net-outflow baseline. Decision cost is T-bill yield forgone on excess buffer + 3 × redemption shortfall, as specified in PS 03. Yield drag uses the latest 91-day T-bill yield available at the forecast origin and is prorated over the forecast horizon; sensitivity multipliers 1/3/5 are also reported.

| target | horizon | policy | n | mean_buffer | mean_excess_cash | mean_yield_drag | mean_shortfall | total_decision_cost | mean_decision_cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| net_flow_liquid | 1 | forecast_p95_buffer | 24 | 80309.66843751994 | 50717.88847413075 | 243.36131182127966 | 0.0 | 5840.671483710712 | 243.36131182127966 |
| net_flow_liquid | 1 | last_year_same_month_outflow | 24 | 29060.389198605437 | 5409.023389267076 | 26.37287799807393 | 5940.414154050834 | 428342.76816361386 | 17847.615340150576 |
| net_flow_liquid | 2 | forecast_p95_buffer | 24 | 80607.27932970122 | 51015.49936631203 | 497.18399421378837 | 0.0 | 11932.415861130921 | 497.18399421378837 |
| net_flow_liquid | 2 | last_year_same_month_outflow | 24 | 29060.389198605437 | 5409.023389267076 | 54.87413772489688 | 5940.414154050834 | 429026.7983970576 | 17876.116599877398 |
| net_flow_liquid | 3 | forecast_p95_buffer | 24 | 80883.89221830879 | 51292.11225491959 | 755.8944584902571 | 0.0 | 18141.46700376617 | 755.8944584902571 |
| net_flow_liquid | 3 | last_year_same_month_outflow | 24 | 29060.389198605437 | 5409.023389267076 | 82.16637243356435 | 5940.414154050834 | 429681.81203006563 | 17903.40883458607 |
| net_flow_overnight | 1 | forecast_p95_buffer | 24 | 25514.940176124175 | 17592.950162690748 | 84.43866670911395 | 1528.0213324666718 | 112044.0639386191 | 4668.502664109129 |
| net_flow_overnight | 1 | last_year_same_month_outflow | 24 | 6190.378721821773 | 3239.1370967670823 | 15.70630117952826 | 6498.769720845407 | 468288.371129178 | 19512.01546371575 |
| net_flow_overnight | 2 | forecast_p95_buffer | 24 | 33719.597559327674 | 24649.18010271573 | 244.4590168052002 | 379.59388928814525 | 33197.77643207127 | 1383.240684669636 |
| net_flow_overnight | 2 | last_year_same_month_outflow | 24 | 6190.378721821773 | 3239.1370967670823 | 32.282817132189784 | 6498.769720845407 | 468686.20751204184 | 19528.59197966841 |
| net_flow_overnight | 3 | forecast_p95_buffer | 24 | 21594.505413454328 | 13898.413764320574 | 207.33251404290078 | 1753.9196967663431 | 131258.19850420632 | 5469.09160434193 |
| net_flow_overnight | 3 | last_year_same_month_outflow | 24 | 6190.378721821773 | 3239.1370967670823 | 48.986440900835895 | 6498.769720845407 | 469087.09448248934 | 19545.295603437055 |

## Next three months

| forecast_month | target | horizon | selected_model | point_forecast | lower05 | lower80 | upper80 | lower95 | upper95 | interval_method | training_through |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10 | net_flow_liquid | 1 | seasonal_naive | 89375.11859293 | 24071.488534677388 | 37525.37949102449 | 142515.28165022592 | 17947.06477148751 | 154968.07638955675 | empirical out-of-fold residual quantiles, grouped by horizon | 2026-09 |
| 2026-11 | net_flow_liquid | 2 | seasonal_naive | -14050.7164701 | -79354.34652835262 | -65900.4555720055 | 39089.44658719593 | -85478.77029154249 | 51542.24132652675 | empirical out-of-fold residual quantiles, grouped by horizon | 2026-09 |
| 2026-12 | net_flow_liquid | 3 | seasonal_naive | -47307.9549328601 | -112611.5849911127 | -99157.6940347656 | 5832.208124435834 | -118736.00875430259 | 18285.002863766655 | empirical out-of-fold residual quantiles, grouped by horizon | 2026-09 |
| 2026-10 | net_flow_overnight | 1 | HistGradientBoosting | 12935.855465421811 | -18778.337126947918 | -13949.20635991754 | 40058.94460772126 | -24791.27236586022 | 50193.22600101771 | empirical out-of-fold residual quantiles, grouped by horizon | 2026-09 |
| 2026-11 | net_flow_overnight | 2 | seasonal_naive | -37624.5264986302 | -71342.34924211333 | -58985.73192974954 | -11391.56262365136 | -74946.09759287798 | -7410.7473118367125 | empirical out-of-fold residual quantiles, grouped by horizon | 2026-09 |
| 2026-12 | net_flow_overnight | 3 | HistGradientBoosting | -17184.635717194284 | -47702.837700749835 | -43186.33213263325 | 8030.6716076356715 | -52664.67799624655 | 16714.38253419156 | empirical out-of-fold residual quantiles, grouped by horizon | 2026-09 |

## March 2027 monthly scenario

| scenario | forecast_month | target | horizon | selected_model | point_forecast | lower05 | lower80 | upper80 | lower95 | upper95 | interval_method | training_through | frequency_note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Advance-tax date month (15 March) | 2027-03 | net_flow_liquid | 6 | seasonal_naive | -134987.644659971 | -200291.2747182236 | -186837.3837618765 | -81847.48160267508 | -206415.69848141348 | -69394.68686334425 | empirical out-of-fold residual quantiles at six-month horizon | 2026-09 | monthly flow estimate; not a daily 15 March forecast |
| Advance-tax date month (15 March) | 2027-03 | net_flow_overnight | 6 | seasonal_naive | -40227.8993096799 | -73945.72205316303 | -61589.104740799245 | -13994.935434701063 | -77549.4704039277 | -10014.120122886416 | empirical out-of-fold residual quantiles at six-month horizon | 2026-09 | monthly flow estimate; not a daily 15 March forecast |

## Limitations

Only 69 monthly observations are available. Model scores and interval tails are noisy; the rolling folds are also used for model selection, so report the comparison as validation rather than an unbiased final holdout. Economic relationships are evaluated with lagged features due lack of exact publication dates. The report does not claim causal drivers. Idle-cash yield drag is proxied with T-bill yield because no direct cash-yield series was supplied. The supplied monthly panel is not rebuilt from its raw source files; verify every source row before treating results as official AMFI history (see `reports/data_validation.md`).
