from pathlib import Path
import json

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "processed" / "monthly_dataset.csv"
OUT = ROOT / "outputs"

st.set_page_config(
    page_title="FlowGuard | Liquidity outlook",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

COLORS = {
    "background": "#071216",
    "surface": "#0B2023",
    "raised": "#103238",
    "teal": "#00D4C3",
    "cyan": "#48F0DE",
    "mint": "#A9F2E7",
    "text": "#F2FBF9",
    "muted": "#A8C6C3",
    "border": "#1D5555",
    "coral": "#FF7B72",
    "amber": "#F2C66D",
}

st.markdown(
    f"""
    <style>
      .stApp {{ background: {COLORS['background']}; color: {COLORS['text']}; }}
      [data-testid="stHeader"] {{ background: rgba(7,18,22,.92); }}
      [data-testid="stSidebar"] {{ background: {COLORS['surface']}; border-right: 1px solid {COLORS['border']}; }}
      .block-container {{ padding-top: 1.5rem; padding-bottom: 2rem; max-width: 1500px; }}
      h1, h2, h3 {{ color: {COLORS['text']}; letter-spacing: -.02em; }}
      p, label, [data-testid="stCaptionContainer"] {{ color: {COLORS['muted']}; }}
      [data-testid="stMetric"] {{ background: {COLORS['surface']}; border: 1px solid {COLORS['border']};
        border-radius: 12px; padding: 16px 18px; }}
      [data-testid="stMetricLabel"] {{ color: {COLORS['muted']}; }}
      [data-testid="stMetricValue"] {{ color: {COLORS['mint']}; }}
      [data-baseweb="tab-list"] {{ gap: 8px; border-bottom: 1px solid {COLORS['border']}; }}
      [data-baseweb="tab"] {{ color: {COLORS['muted']}; }}
      [aria-selected="true"][data-baseweb="tab"] {{ color: {COLORS['cyan']}; }}
      div.stButton > button {{ background: {COLORS['teal']}; color: #061617; border: 0; font-weight: 700; }}
      [data-testid="stDataFrame"] {{ border: 1px solid {COLORS['border']}; border-radius: 8px; }}
      .fg-eyebrow {{ font-family: monospace; letter-spacing: .12em; text-transform: uppercase;
        color: {COLORS['cyan']}; font-size: .76rem; }}
      .fg-note {{ background: {COLORS['surface']}; border-left: 3px solid {COLORS['amber']};
        padding: .7rem 1rem; border-radius: 0 8px 8px 0; color: {COLORS['muted']}; }}
      @media (max-width: 700px) {{ .block-container {{ padding: 1rem .8rem 1.5rem; }} }}
    </style>
    """,
    unsafe_allow_html=True,
)


REQUIRED = [
    "next_3_month_forecasts.csv",
    "cash_buffer_recommendation.csv",
    "model_metrics.csv",
    "interval_metrics.csv",
    "driver_oos_comparison.csv",
    "buffer_policy_comparison.csv",
    "buffer_cost_sensitivity.csv",
    "forecast_metadata.json",
]
missing = [name for name in REQUIRED if not (OUT / name).exists()]
if not DATA.exists() or missing:
    st.error("FlowGuard data or pipeline outputs are missing.")
    st.code("python src/prepare_data.py\npython src/run_pipeline.py")
    if missing:
        st.caption("Missing output files: " + ", ".join(missing))
    st.stop()


@st.cache_data
def load_data():
    data = pd.read_csv(DATA)
    forecast = pd.read_csv(OUT / "next_3_month_forecasts.csv")
    buffers = pd.read_csv(OUT / "cash_buffer_recommendation.csv")
    metrics = pd.read_csv(OUT / "model_metrics.csv")
    interval_metrics = pd.read_csv(OUT / "interval_metrics.csv")
    drivers = pd.read_csv(OUT / "driver_oos_comparison.csv")
    policies = pd.read_csv(OUT / "buffer_policy_comparison.csv")
    sensitivity = pd.read_csv(OUT / "buffer_cost_sensitivity.csv")
    metadata = json.loads((OUT / "forecast_metadata.json").read_text())
    march_path = OUT / "march_15_scenario.csv"
    march = pd.read_csv(march_path) if march_path.exists() else pd.DataFrame()
    return data, forecast, buffers, metrics, interval_metrics, drivers, policies, sensitivity, metadata, march


(
    data,
    forecasts,
    buffers,
    metrics,
    interval_metrics,
    drivers,
    policies,
    sensitivity,
    metadata,
    march,
) = load_data()

data["month_dt"] = pd.to_datetime(data["month"])
data_as_of = metadata.get("data_as_of_month", "Unknown")
obs_count = len(data)

st.markdown('<div class="fg-eyebrow">Zeckathon · PS 03 · Forecasting & liquidity risk</div>', unsafe_allow_html=True)
st.title("FlowGuard")
st.caption("Monthly fund-flow outlook and cash-buffer decision support for Liquid and Overnight mutual fund categories · ₹ crore")

st.markdown(
    '<div class="fg-note"><b>Data caveat:</b> AMFI monthly flow series use archived official reports. '
    'Supplementary RBI, NSE, yield, and tax-calendar panels lack retrieval-level audit metadata; '
    'qualify driver and yield-cost findings.</div>',
    unsafe_allow_html=True,
)

k1, k2, k3 = st.columns(3)
k1.metric("Data through", str(data_as_of))
k2.metric("Monthly observations", f"{obs_count}")
k3.metric("Evaluation window", "Last 24 target months")

st.info("March 15 is the advance-tax decision context. The model forecasts monthly flows; it does not predict daily or five-day redemptions.")

overview_tab, buffer_tab, evidence_tab, method_tab = st.tabs(
    ["Overview & forecasts", "Cash buffer & policy", "Model evidence", "March 15 & method"]
)


def pretty_category(series):
    return series.astype(str).str.replace("net_flow_", "", regex=False).str.title()


def format_crore(value):
    if pd.isna(value):
        return "—"
    return f"₹{value:,.0f} Cr"


def themed_plot(fig, height=400):
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor=COLORS["surface"],
        plot_bgcolor=COLORS["surface"],
        font={"color": COLORS["text"], "family": "Inter, sans-serif"},
        height=height,
        margin={"l": 20, "r": 20, "t": 55, "b": 20},
        legend={"orientation": "h", "yanchor": "bottom", "y": 1.02, "xanchor": "right", "x": 1},
        hovermode="x unified",
    )
    fig.update_xaxes(gridcolor=COLORS["border"], zerolinecolor=COLORS["border"])
    fig.update_yaxes(gridcolor=COLORS["border"], zerolinecolor=COLORS["border"])
    return fig


with overview_tab:
    st.subheader("Next three monthly releases")
    category_options = {"Liquid": "net_flow_liquid", "Overnight": "net_flow_overnight"}
    chosen_category = st.radio("Fund category", list(category_options), horizontal=True, key="forecast_category")
    chosen_target = category_options[chosen_category]
    current_forecasts = forecasts[forecasts["target"] == chosen_target].copy()
    current_forecasts = current_forecasts.sort_values("horizon")
    current_forecasts["target"] = pretty_category(current_forecasts["target"])
    current_forecasts["Point forecast"] = current_forecasts["point_forecast"].map(format_crore)
    current_forecasts["80% interval"] = current_forecasts.apply(
        lambda r: f"{format_crore(r['lower80'])} to {format_crore(r['upper80'])}", axis=1
    )
    current_forecasts["95% interval"] = current_forecasts.apply(
        lambda r: f"{format_crore(r['lower95'])} to {format_crore(r['upper95'])}", axis=1
    )
    st.dataframe(
        current_forecasts[["forecast_month", "target", "selected_model", "Point forecast", "80% interval", "95% interval"]],
        width="stretch",
        hide_index=True,
    )

    st.subheader(f"{chosen_category} monthly net flow")
    target_hist = data[["month_dt", chosen_target]].dropna().sort_values("month_dt")
    target_fc = forecasts[forecasts["target"] == chosen_target].copy().sort_values("horizon")
    target_fc["month_dt"] = pd.to_datetime(target_fc["forecast_month"])
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=pd.concat([target_fc["month_dt"], target_fc["month_dt"][::-1]]),
            y=pd.concat([target_fc["upper95"], target_fc["lower95"][::-1]]),
            fill="toself", fillcolor="rgba(0,212,195,.10)", line={"color": "rgba(0,0,0,0)"},
            name="95% interval", hoverinfo="skip",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=pd.concat([target_fc["month_dt"], target_fc["month_dt"][::-1]]),
            y=pd.concat([target_fc["upper80"], target_fc["lower80"][::-1]]),
            fill="toself", fillcolor="rgba(72,240,222,.24)", line={"color": "rgba(0,0,0,0)"},
            name="80% interval", hoverinfo="skip",
        )
    )
    fig.add_trace(
        go.Scatter(x=target_hist["month_dt"], y=target_hist[chosen_target], mode="lines+markers",
                   name="Observed", line={"color": COLORS["mint"], "width": 2}, marker={"size": 5})
    )
    bridge_x = [target_hist["month_dt"].iloc[-1]] + target_fc["month_dt"].tolist()
    bridge_y = [target_hist[chosen_target].iloc[-1]] + target_fc["point_forecast"].tolist()
    fig.add_trace(
        go.Scatter(x=bridge_x, y=bridge_y, mode="lines+markers", name="Forecast",
                   line={"color": COLORS["cyan"], "width": 2.5, "dash": "dash"}, marker={"size": 8, "symbol": "diamond"})
    )
    fig.add_hline(y=0, line_color=COLORS["muted"], line_width=1)
    fig.update_layout(title="Observed history with forecast uncertainty", xaxis_title="Month", yaxis_title="Net flow (₹ crore)")
    st.plotly_chart(themed_plot(fig, 440), width="stretch")
    st.caption("Positive values indicate net inflow; negative values indicate net outflow. Interval tails are uncertain with the available sample.")


with buffer_tab:
    st.subheader("Potential-outflow buffer")
    st.write("Rule: max(0, − one-sided lower 5% net-flow forecast). This is the project’s 95th-percentile potential-outflow buffer estimate.")
    display_buffers = buffers.copy()
    display_buffers["target"] = pretty_category(display_buffers["target"])
    display_buffers["Recommended buffer"] = display_buffers["p95_potential_outflow_buffer"].map(format_crore)
    display_buffers["Point net flow"] = display_buffers["point_net_flow"].map(format_crore)
    display_buffers["Lower 5% net flow"] = display_buffers["one_sided_lower05_net_flow"].map(format_crore)
    st.dataframe(
        display_buffers[["forecast_month", "target", "selected_model", "Point net flow", "Lower 5% net flow", "Recommended buffer"]],
        width="stretch", hide_index=True,
    )

    st.subheader("Historical policy-cost comparison")
    st.caption("FlowGuard buffer versus the prior-year same-month outflow baseline. Cost includes yield drag and a 3× redemption-shortfall penalty.")
    policy_view = policies.copy()
    policy_view["target"] = pretty_category(policy_view["target"])
    st.dataframe(policy_view.sort_values(["target", "horizon", "policy"]), width="stretch", hide_index=True)
    one_month = policy_view[policy_view["horizon"] == 1]
    if not one_month.empty:
        cost_fig = px.bar(
            one_month, x="target", y="mean_decision_cost", color="policy", barmode="group",
            labels={"mean_decision_cost": "Mean decision cost (₹ crore)", "target": "Fund category", "policy": "Policy"},
            title="Mean decision cost · one-month horizon",
            color_discrete_sequence=[COLORS["cyan"], COLORS["coral"], COLORS["mint"]],
        )
        st.plotly_chart(themed_plot(cost_fig, 360), width="stretch")

    st.subheader("Shortfall-penalty sensitivity")
    sens_view = sensitivity.copy()
    sens_view["target"] = pretty_category(sens_view["target"])
    st.dataframe(sens_view.sort_values(["target", "horizon", "policy"]), width="stretch", hide_index=True)
    st.caption("Idle-cash yield drag uses the latest prior-known 91-day T-bill yield as a proxy; no direct cash-yield series is supplied. Cost estimates inherit the data and backtest limitations.")


with evidence_tab:
    st.subheader("Rolling-origin model comparison")
    st.write("The last 24 target months are used for both model selection and reported comparison; scores are validation estimates, not an independent final holdout.")
    metrics_view = metrics.copy()
    metrics_view["target"] = pretty_category(metrics_view["target"])
    st.dataframe(metrics_view.sort_values(["target", "horizon", "MAE"]), width="stretch", hide_index=True)
    st.caption("MAPE is supplementary and can be unstable when actual monthly flows are close to zero.")

    st.subheader("Prediction-interval calibration")
    selected_models = (
        metrics.sort_values("MAE").groupby(["target", "horizon"], as_index=False).first()
    )
    calibrated = interval_metrics.merge(
        selected_models[["target", "horizon", "model"]], on=["target", "horizon", "model"], how="inner"
    )
    calibrated["target"] = pretty_category(calibrated["target"])
    st.dataframe(
        calibrated[["target", "horizon", "interval", "n_test", "empirical_coverage", "mean_width", "mean_edge_pinball_loss"]],
        width="stretch", hide_index=True,
    )

    st.subheader("Incremental driver value")
    st.caption("Driver ablations are predictive comparisons against an autoregressive baseline, not causal effects. Negative values indicate that a driver set worsened MAE in these folds.")
    driver_view = drivers[drivers["driver_set"] != "autoregressive_only"].copy()
    driver_view["target"] = pretty_category(driver_view["target"])
    st.dataframe(driver_view.sort_values(["target", "horizon", "MAE"]), width="stretch", hide_index=True)


with method_tab:
    st.subheader("March 15 advance-tax context")
    st.write("The problem statement frames March 15 as an advance-tax liquidity decision. The supplied target data are monthly category-level flows, so this dashboard does not claim to estimate the redemption amount on March 15 or within a five-day window.")
    if not march.empty:
        st.markdown("#### Optional March 2027 monthly scenario")
        st.caption("Six-month-ahead monthly scenario; not a single-day March 15 forecast.")
        march_view = march.copy()
        march_view["target"] = pretty_category(march_view["target"])
        march_cols = [c for c in ["scenario", "forecast_month", "target", "selected_model", "point_forecast", "lower80", "upper80", "lower95", "upper95", "frequency_note"] if c in march_view.columns]
        st.dataframe(march_view[march_cols], width="stretch", hide_index=True)
    else:
        st.info("No optional March scenario output is present. The required next-three-month forecasts remain available in the Overview tab.")

    st.subheader("Data and modeling notes")
    st.markdown(
        """
        - **Target:** monthly net flow for Indian Liquid and Overnight mutual fund categories; positive is inflow, negative is outflow.
        - **Data:** AMFI reports from January 2021 through the latest month shown in the data-vintage card; values are in ₹ crore.
        - **Models:** seasonal naive, additive ETS, and regularized HistGradientBoosting; selection is performed by category and horizon using rolling-origin MAE.
        - **Intervals:** empirical out-of-fold residual intervals; tails are uncertain with 69 monthly observations.
        - **Timing:** economic inputs are lagged one month; scheduled calendar events are known ahead and aligned to their target month.
        - **Limitations:** supplementary RBI, NSE, yield, and tax-calendar series still need row-level source verification. The 91-day T-bill yield is only a cash-yield proxy.
        """
    )
    st.caption(f"Data vintage: {data_as_of} · Source and validation details: reports/data_validation.md")

st.markdown("---")
st.caption("FlowGuard · Monthly decision support · Validate source inputs and model uncertainty before operational use.")
