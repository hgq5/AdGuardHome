import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import ReactTable from 'react-table';
import classNames from 'classnames';
import {
    checkFiltered,
    checkRewrite,
    checkRewriteHosts,
    checkWhiteList,
} from '../../helpers/helpers';
import { TABLE_DEFAULT_PAGE_SIZE } from '../../helpers/constants';
import getDateCell from './Cells/getDateCell';
import getDomainCell from './Cells/getDomainCell';
import getClientCell from './Cells/getClientCell';
import getResponseCell from './Cells/getResponseCell';

class Table extends Component {
    columns = [
        {
            Header: this.props.t('time_table_header'),
            accessor: 'time',
            Cell: row => getDateCell(row, this.props.isDetailed),
            minWidth: 50,
            headerClassName: 'logs__header',
        },
        {
            Header: this.props.t('request_table_header'),
            accessor: 'domain',
            Cell: row => getDomainCell(row, this.props.isDetailed),
            minWidth: 150,
            headerClassName: 'logs__header',
        },
        {
            Header: this.props.t('response_table_header'),
            accessor: 'response',
            Cell: row => getResponseCell(row, this.props.filtering, this.props.t, this.props.isDetailed),
            headerClassName: 'logs__header',
        },
        {
            Header: () => {
                const plainSelected = classNames({
                    'icon--selected': !this.props.isDetailed,
                });

                const detailedSelected = classNames({
                    'icon--selected': this.props.isDetailed,
                });

                return <div className="d-flex justify-content-between">
                    {this.props.t('client_table_header')}
                    <span>
                        <svg className={`icons icon--small icon--active mr-2 ${detailedSelected}`}
                             onClick={() => this.props.toggleDetailedLogs(true)}>
                            <use xlinkHref='#list' />
                        </svg>
                    <svg
                        className={`icons icon--small icon--active ${plainSelected}`}
                        onClick={() => this.props.toggleDetailedLogs(false)}>
                        <use xlinkHref='#detailed_list' />
                    </svg>
                    </span>
                </div>;
            },
            accessor: 'client',
            Cell: row => getClientCell(row, this.props.t, this.props.isDetailed),
            headerClassName: 'logs__header',
        },
    ];


    fetchData = (state) => {
        const { pages } = state;
        const { oldest, page, getLogs } = this.props;
        const isLastPage = pages && (page + 1 === pages);

        if (isLastPage) {
            getLogs(oldest, page);
        }
    };

    changePage = (page) => {
        this.props.setLogsPage(page);
        this.props.setLogsPagination({
            page,
            pageSize: TABLE_DEFAULT_PAGE_SIZE,
        });
    };

    render() {
        const {
            t,
            processingGetLogs,
            processingGetConfig,
            logs,
            pages,
            page,
            defaultPageSize,
        } = this.props;
        const isLoading = processingGetLogs || processingGetConfig;

        return (
            <ReactTable
                manual
                minRows={5}
                page={page}
                pages={pages}
                columns={this.columns}
                filterable={false}
                sortable={false}
                resizable={false}
                data={logs || []}
                loading={isLoading}
                showPagination={true}
                showPageJump={false}
                showPageSizeOptions={false}
                onFetchData={this.fetchData}
                onPageChange={this.changePage}
                className="logs__table"
                defaultPageSize={defaultPageSize || TABLE_DEFAULT_PAGE_SIZE}
                previousText={t('previous_btn')}
                nextText={t('next_btn')}
                loadingText={t('loading_table_status')}
                rowsText={t('rows_table_footer_text')}
                noDataText={t('no_logs_found')}
                pageText={''}
                ofText={''}
                renderTotalPagesCount={() => false}
                getTrProps={(_state, rowInfo) => {
                    if (!rowInfo) {
                        return {};
                    }

                    const { reason } = rowInfo.original;

                    if (checkFiltered(reason)) {
                        return {
                            className: 'red',
                        };
                    } else if (checkWhiteList(reason)) {
                        return {
                            className: 'green',
                        };
                    } else if (checkRewrite(reason) || checkRewriteHosts(reason)) {
                        return {
                            className: 'blue',
                        };
                    }

                    return {
                        className: '',
                    };
                }}
            />
        );
    }
}

Table.propTypes = {
    logs: PropTypes.array.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    defaultPageSize: PropTypes.number,
    oldest: PropTypes.string.isRequired,
    filtering: PropTypes.object.isRequired,
    processingGetLogs: PropTypes.bool.isRequired,
    processingGetConfig: PropTypes.bool.isRequired,
    isDetailed: PropTypes.bool.isRequired,
    setLogsPage: PropTypes.func.isRequired,
    setLogsPagination: PropTypes.func.isRequired,
    getLogs: PropTypes.func.isRequired,
    toggleDetailedLogs: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default withNamespaces()(Table);