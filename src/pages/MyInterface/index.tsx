import {
  ListMyInterfaceInfoVOByPageUsingPOST,
  ListOwnInterfaceInfoVOByPageUsingPOST,
} from '@/services/api-tomato-backend  /interfaceInfoController';
import { FrownOutlined, ShareAltOutlined, SmileOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Layout, List, message, Pagination, PaginationProps, Tooltip } from 'antd';
import Search from 'antd/es/input/Search';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import React, { useEffect, useState } from 'react';
import indexStyle from './index.less';

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  height: '64px',
  paddingInline: '30%',
  lineHeight: '64px',
  color: '#fff',
  background: 'none',
};
const footerStyle: React.CSSProperties = {
  textAlign: 'center',
};

const contentStyle: React.CSSProperties = {
  minHeight: 120,
  lineHeight: '120px',
};

const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [list, setList] = useState<API.InterfaceInfoVO[]>([]);
  const loadData = async (searchText = '', current = 1, pageSize = 6) => {
    setLoading(true);
    try {
      await ListMyInterfaceInfoVOByPageUsingPOST({
        name: searchText,
        current,
        pageSize,
      }).then((res) => {
        setTotal(res?.data?.total ?? 0);
        setList(res?.data?.records ?? []);
      });
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
    setLoading(false);
  };
  const [flag, setFlag] = useState(0);
  const handleOnclickByMyInterface = async () => {
    // 点击按钮修改flag状态
    if (flag === 1) {
      console.log('开通');
      setLoading(true);
      try {
        await ListMyInterfaceInfoVOByPageUsingPOST({
          name: '',
          current: 1,
          pageSize: 6,
        }).then((res) => {
          setTotal(res?.data?.total ?? 0);
          setList(res?.data?.records ?? []);
        });
        //重置页码
        setCurrent(1);
      } catch (error: any) {
        message.error('请求失败，' + error.message);
      }
      setLoading(false);
    } else {
      console.log('创建');
      setLoading(true);
      try {
        await ListOwnInterfaceInfoVOByPageUsingPOST({
          name: '',
          current: 1,
          pageSize: 6,
        }).then((res) => {
          setTotal(res?.data?.total ?? 0);
          setList(res?.data?.records ?? []);
        });
        //重置页码
        setCurrent(1);
      } catch (error: any) {
        message.error('请求失败，' + error.message);
      }
      setLoading(false);
    }
    setFlag(flag === 1 ? 0 : 1);
  };

  //初次进入我的接口 加载页面
  useEffect(() => {
    loadData();
  }, []);

  const reFresh = () => {
    //重置页码
    setCurrent(1);
    setFlag(0);
    loadData();
  };

  const onSearch = (value: string) => {
    setSearchText(value);
    loadData(value);
  };

  const onChange: PaginationProps['onChange'] = (pageNumber, pageSize) => {
    setCurrent(pageNumber);
    loadData(searchText, pageNumber, pageSize);
  };

  //size变化同样可以触发onChange
  // const onSizeChange = (current: number, size: number) => {
  //   console.log('SizeChange');
  //   loadData(searchText, current, size);
  // };

  const CardInfo: React.FC<{
    totalNum: React.ReactNode;
    leftNum: React.ReactNode;
  }> = ({ totalNum, leftNum }) => (
    <div className={indexStyle.cardInfo}>
      <div>
        <p>已调用次数</p>
        <p>{totalNum}</p>
      </div>
      <div>
        <p>剩余调用次数</p>
        <p>{leftNum}</p>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <Layout>
        <div style={{ marginLeft: '21%', marginBottom: '-3%' }}>
          <Button type="primary" shape="round" onClick={reFresh}>
            刷新
          </Button>
        </div>
        <div style={{ marginLeft: '72%', marginBottom: '-3.7%' }}>
          {flag === 0 ? (
            <Button type="primary" shape="round" onClick={handleOnclickByMyInterface}>
              查看我创建的接口
            </Button>
          ) : null}
          {flag === 1 ? (
            <Button type="primary" shape="round" onClick={handleOnclickByMyInterface}>
              查看我开通的接口
            </Button>
          ) : null}
        </div>

        <Header style={headerStyle}>
          <Search size={'large'} placeholder="请输入接口名称" onSearch={onSearch} enterButton />
        </Header>
        <Content style={contentStyle}>
          <List<API.InterfaceInfoVO>
            className={indexStyle.filterCardList}
            grid={{ gutter: 24, xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }}
            dataSource={list || []}
            loading={loading}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  bodyStyle={{ paddingBottom: 20 }}
                  actions={[
                    item.status === 1
                      ? [
                          <Tooltip title="分享" key="share">
                            <ShareAltOutlined />
                          </Tooltip>,
                        ]
                      : [
                          <Tooltip title="接口已关闭" key="share">
                            <FrownOutlined />
                          </Tooltip>,
                        ],
                    <Tooltip title="在线调用" key="share">
                      <div
                        onClick={() => {
                          history.push('/interface_info/' + item.id);
                        }}
                      >
                        在线调用
                      </div>
                    </Tooltip>,
                    item.isOwnerByCurrentUser === true
                      ? [
                          <Tooltip title="已创建该接口" key="share">
                            <div
                              onClick={() => {
                                history.push('/admin/interface_info');
                              }}
                            >
                              管理接口
                            </div>
                          </Tooltip>,
                        ]
                      : [
                          <Tooltip title="已开通该接口" key="share">
                            <SmileOutlined />
                          </Tooltip>,
                        ],
                  ]}
                >
                  <Card.Meta title={item.name} />
                  <div>
                    <CardInfo totalNum={item.totalNum} leftNum={item.leftNum} />
                  </div>
                </Card>
              </List.Item>
            )}
          />
          <Footer style={footerStyle}>
            <Pagination
              showQuickJumper
              showSizeChanger
              pageSizeOptions={[6, 10, 20]}
              current={current}
              // onShowSizeChange={onSizeChange}
              defaultPageSize={6}
              total={total}
              onChange={onChange}
            />
          </Footer>
        </Content>
      </Layout>
    </PageContainer>
  );
};

export default Index;
