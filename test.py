import os
import random
import string
import threading
import time
import unittest

from selenium import webdriver

from example_python.main import app

# see: https://blog.miguelgrinberg.com/post/using-headless-chrome-with-selenium
# configuration
# https://www.kenst.com/2019/02/installing-chromedriver-on-windows/
os.environ['PATH'] += os.pathsep + r'C:\ProgramData\chocolatey\lib\chromedriver\tools'
port = 5066
host_name = f'http://localhost:{port}'


class SeleniumTest(unittest.TestCase):
    driver = None

    @classmethod
    def setUpClass(cls) -> None:
        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        try:
            cls.driver = webdriver.Chrome(options=options)
        except Exception as e:
            print(f'ERROR: {e}')

        if cls.driver:
            # create client
            cls.app = app
            cls.app.testing = True
            cls.app_context = cls.app.app_context()
            cls.app_context.push()

            # start the Flask server in a thread
            threading.Thread(target=cls.app.run, kwargs=dict(port=port)).start()

            # give the server a second to ensure it is up
            time.sleep(3)

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            # stop the flask server and the browser
            cls.driver.get(f'{host_name}/shutdown')
            cls.driver.stop_client()
            cls.driver.quit()

            # destroy database
            # remove application context
            cls.app_context.pop()

    def setUp(self):
        if not self.driver:
            self.skipTest('Web browser not available')

    def tearDown(self):
        pass

    def set_text(self, item_id: str, text: str = '', parent=None):
        """
        clear and set the input element identified by the item_id

        :param item_id: id of item to set text or css selector
        :param text:
        :param parent: {Object} parent dom object
        """
        if not parent:
            parent = self.driver
        try:
            input_element = parent.find_element_by_id(item_id)
        except:
            input_element = parent.find_element_by_css_selector(item_id)

        input_element.clear()
        input_element.send_keys(text)

    def assertDisplayed(self, item: object, msg=''):
        """
        assert that item is displayed.

        :param item: id or a selenium element.  if id is str tries to find by id
        """
        if type(item) == str:
            item = self.driver.find_element_by_id(item)
        self.assertTrue(item.is_displayed(), f'Item is not displayed {msg}')

    def assertHidden(self, item: object, msg: str = ''):
        """
        assert that item is hidden.

        :param item: id or a selenium element.  if id is str tries to find by id
        :param msg: optional message when test fails
        """
        if type(item) == str:
            item = self.driver.find_element_by_id(item)
        self.assertFalse(item.is_displayed(), f'Item is not hidden {msg}')

    @staticmethod
    def random_string(length: int = 20):
        return ''.join([random.choice(string.ascii_letters) for r in range(length)])

    def wait_for(condition_function):
        start_time = time.time()
        while time.time() < start_time + 3:
            if condition_function():
                return True
            else:
                time.sleep(0.1)
        raise Exception('Timeout waiting for {}'.format(condition_function.__name__))


class PageIndex(SeleniumTest):

    def load_page(self):
        start_time = time.time()
        self.driver.get(f'{host_name}/')
        while time.time() < start_time + 5:
            p = self.driver.find_element_by_id('loading_finished')
            if p.text == 'finished':
                return True
            else:
                time.sleep(0.1)
        raise Exception('Timeout waiting for page to load')

    def assertMessage(self, message):
        self.assertEqual(message, self.driver.find_element_by_id(f'message').text)

    def setUp(self):
        self.load_page()
        self.initial_list_count = 5

    def test_load(self):
        main_content = self.driver.find_element_by_id('view-content')
        self.assertTrue(main_content)

    def test_children_tables(self):
        for t, b, c in [('children_table', 'add_child_button', 'clear_child_button'),
                        ('list_children_table', 'add_list_child_button', 'clear_list_child_button'),
                        ('other_children_table', 'add_other_child_button', 'clear_other_child_button')]:
            table = self.driver.find_element_by_id(t)
            self.assertTrue(table, t)
            tr_list = table.find_elements_by_css_selector('tbody tr')
            tr_count = len(tr_list)
            self.assertEqual(5, tr_count, t)
            # add one
            self.driver.find_element_by_id(b).click()
            tr_list = table.find_elements_by_css_selector('tbody tr')
            self.assertEqual(len(tr_list), tr_count + 1, t)
            # remove one
            buttons = table.find_elements_by_tag_name('button')
            buttons[0].click()
            tr_list = table.find_elements_by_css_selector('tbody tr')
            self.assertEqual(len(tr_list), tr_count, t)
            # update input
            new_value = self.random_string()
            td_name = tr_list[1].find_elements_by_tag_name('td')[2]
            name = td_name.text
            tr_list[1].find_elements_by_tag_name('input')[0].send_keys(new_value)
            self.assertEqual(name + new_value, td_name.text, t)
            # remove all
            self.driver.find_element_by_id(c).click()
            tr_list = table.find_elements_by_css_selector('tbody tr')
            self.assertEqual(0, len(tr_list), t)
            # add one again
            self.driver.find_element_by_id(b).click()
            tr_list = table.find_elements_by_css_selector('tbody tr')
            self.assertEqual(1, len(tr_list), t)

    def test_input(self):
        input_input = self.driver.find_element_by_id('input_input')
        v = self.random_string()
        self.set_text('input_input', v)
        input_input_p = self.driver.find_element_by_id('inputValue')
        self.assertEqual(v, input_input.get_attribute('value'))
        self.assertEqual(v, input_input_p.text)

    def test_attr(self):
        s = self.driver.find_element_by_id('title')
        self.assertEqual('background: yellow;', s.get_attribute('style'))

    def test_select(self):
        s = self.driver.find_element_by_id('select')
        p = self.driver.find_element_by_id('selectValue')
        self.assertEqual("feline", p.text)
        self.assertEqual("feline", s.get_attribute("value"))
        for opt in [{'value': 'dog', 'label': 'Dog'}, {'value': 'feline', 'label': 'Cat'}]:
            o = s.find_elements_by_css_selector(f"option[value={opt['value']}")[0]
            o.click()
            self.assertEqual(opt['value'], p.text)

    def test_counter_click(self):
        button = self.driver.find_element_by_id('counter_add_button')
        p = self.driver.find_element_by_id('counter')
        p_greater = self.driver.find_element_by_id('counter_greater_than_10')
        p_less = self.driver.find_element_by_id('counter_less_than_10')
        for z in range(20):
            self.assertEqual(z, int(p.text))
            if z < 10:
                self.assertDisplayed(p_less, z)
                self.assertHidden(p_greater, z)
            if z == 10:
                self.assertHidden(p_less, z)
                self.assertHidden(p_greater, z)
            if z > 10:
                self.assertHidden(p_less, z)
                self.assertDisplayed(p_greater, z)
            button.click()

        button = self.driver.find_element_by_id('counter_reset_button').click()
        self.assertEqual(0, int(p.text))
        self.assertDisplayed(p_less, 0)
        self.assertHidden(p_greater, 0)


class PageAbout(SeleniumTest):
    def test_get(self):
        self.driver.get(f'{host_name}/about')
        self.assertEqual(
            self.driver.title,
            'DeclareMVC Example and Testing application')


if __name__ == '__main__':
    unittest.main()
