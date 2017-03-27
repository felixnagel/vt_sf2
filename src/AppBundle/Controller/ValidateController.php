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
use Symfony\Bundle\FrameworkBundle\DependencyInjection\Configuration;

class ValidateController extends DefaultController implements AuthentificatedController{
    /**
     * @Route("/validate/map/{map_id}", name="validate/map")
     */
    public function validateAction($map_id){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();

        if(!is_numeric($map_id)){
            $sMapId = serialize($map_id);
            throw new \Exception(sprintf(
                'No numeric value given for iMapId! | user_id[%s], map_id[%s]', $iUserId, $sMapId
            ));
        }
        $iMapId = (int)$map_id;

        $aTplData = [
            'aBaseSettings' => $this->container->getParameter('app.base'),
            'aBlockDefinitions' => $this->container->getParameter('app.blocks'),
            'aSpritesheetDefinitions' => $this->container->getParameter('app.spritesheets'),
            'iMapId' => $iMapId,
        ];

        return $this->render('race/validate.html.twig', $aTplData);
    }

    /**
     * @Route("/validate/load/{map_id}", name="validate/load")
     */
    public function loadAction($map_id){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();

        $oMap = $this->_load_map($map_id);

        if($oMap->getCreatedBy() != $iUserId){
            throw new \Exception(sprintf(
                'Map createdBy differs from iUserId! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }
        if($oMap->getReleasedAt() !== null){
            throw new \Exception(sprintf(
                'Map was already released! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }

        return new JsonResponse($oMap->getBlocks());
    }


}
