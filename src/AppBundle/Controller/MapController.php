<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use LuckyNail\SimpleForms\Form;
use Symfony\Component\Yaml\Yaml;
use AppBundle\Entity\Map;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class MapController extends Controller implements AuthentificatedController{
}
